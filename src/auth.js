import jwt from 'jsonwebtoken'
import { UserSchema } from '@/model/user.mjs'

const JWT_SECRET = 'FSE-SB1';

export const register = async (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;

    if (await UserSchema.findOne({ username })) {
        if (UserSchema.findOne({ username }).password == password) {
            // Currently do nothing iter 0
            return res.status(400).json({ message: 'User already exists' })
        }
        return res.status(403).json({ message: 'User exists but incorrect password' })
    }

    const user = new UserSchema({ username: username, password });
    user.save()
        .then(() => {
            res.status(201).json({ message: 'User registered successfully' })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message })
        });

    const token = jwt.sign({ username: username }, JWT_SECRET, {
        expiresIn: '1h',
        }); // can change to 2 tokens in the future
}

export const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = user;
        next();
    });
}