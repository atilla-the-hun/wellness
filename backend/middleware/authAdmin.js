import jwt from "jsonwebtoken";

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        // Check for token in header
        const token = req.headers.token;

        console.log('Auth headers:', req.headers);
        console.log('Received token:', token);

        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login.' 
            });
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            if (!decoded || !decoded.isAdmin) {
                console.log('Invalid token or not admin:', decoded);
                return res.status(401).json({ 
                    success: false, 
                    message: 'Not authorized as admin' 
                });
            }

            req.admin = decoded;
            next();
        } catch (tokenError) {
            console.error('Token verification error:', tokenError);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please login again.' 
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error in authentication' 
        });
    }
};

export default authAdmin;
