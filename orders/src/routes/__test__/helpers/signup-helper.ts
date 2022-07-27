import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const signup = () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    password: 'password',
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
};

export { signup };
