import * as Yup from 'yup';
import pt from 'date-fns/locale/pt';
import { addMonths, parseISO, format } from 'date-fns';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

import Mail from '../../lib/Mail';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findByPk(req.body.student_id);
    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    const plan = await Plan.findByPk(req.body.plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    const end_date = addMonths(parseISO(req.body.start_date), plan.duration);
    const price = plan.price * plan.duration;

    const data = { ...req.body, end_date, price };

    const { id, student_id, plan_id, start_date } = await Enrollment.create(
      data
    );

    await Mail.sendMail({
      to: `${student.name} <${student.email}`,
      subject: 'Matrícula realizada',
      template: 'enrollment-completed',
      context: {
        student: student.name,
        plan: plan.title,
        planDuration:
          plan.duration > 1 ? `${plan.duration} meses` : `${plan.duration} mês`,
        endDate: format(end_date, "'dia' dd 'de' MMMM, 'às' HH:mm'h'", {
          locale: pt,
        }),
        price: `R$ ${plan.price}`,
      },
    });

    return res.json({
      id,
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });
  }
}

export default new EnrollmentController();
