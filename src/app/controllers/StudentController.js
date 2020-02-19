import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      date_of_birth: Yup.date().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const studentExists = await Student.findOne({ where: { email } });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const { id, name, date_of_birth, weight, height } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      date_of_birth,
      weight,
      height,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(10),
      email: Yup.string().email(),
      date_of_birth: Yup.date(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const { email } = req.body;
    if (email && email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });
      if (studentExists) {
        return res.status(400).json({ error: 'This email is already in use' });
      }
    }

    const studentUpdated = await student.update(req.body);

    return res.json(studentUpdated);
  }
}

export default new StudentController();
