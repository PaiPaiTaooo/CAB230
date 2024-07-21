const jwt = require('jsonwebtoken');
const JWT_SECRET = `yXfLDAazhEuJUe6cbwjmGYk4rNSsvMH5nZ2p7WFPtBdCTgR3V8`;

function authorisation(req, res, next){

	if(('authorization' in req.headers)){
		
		if(req.headers.authorization.match(/^Bearer /)){
			req.userId=true;
			const token = req.headers.authorization.replace(/^Bearer /, '');
			
			try {
				jwt.verify(token, JWT_SECRET);
				req.email = jwt.verify(token, JWT_SECRET).InputEmailLogin;
				console.log(req.email);
			} catch (e) {
				if (e.name === 'TokenExpiredError') {
					res.status(401).json({ error: true, message: 'JWT token has expired' });
					return;
				} else {
					res.status(401).json({ error: true, message: 'Invalid JWT token' });
					return;
				}
			}
			next();
		}else{
			return res.status(401).json({ error: true, message: 'Authorization header is malformed'});
		}
	}else{
		req.userId=false;
		next();
	}
}
module.exports = authorisation;