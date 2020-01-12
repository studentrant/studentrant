const http      = require("http");
const constants = require("../constants/");
const { check } = require("express-validator");

module.exports = class ValidatorMiddleware {
    static PasswordValidator(req,res,next) {
	if ( ! req.body.password )
	    return res.status(412).json({ status: 412 , message: constants.loginConstants.INVALID_LOGIN_PASSWORD_NO_FIELD});
	if ( req.body.password.length < 8 )
	    return res.status(412).json({ status: 412 , message: constants.loginConstants.INVALID_LOGIN_PASSWORD_LENGTH });
	if ( ! /\d/.test(req.body.password) )
	    return res.status(412).json({ status: 412, message: constants.loginConstants.INVALID_LOGIN_PASSWORD_NO_DIGIT });
	if ( ! /[A-Za-z]/.test(req.body.password) )
	    return res.status(412).json({ status : 412 , message: constants.loginConstants.INVALID_LOGIN_PASSWORD_NO_CHARS });
	return next();
    }
    static UserNameValidator(req,res,next) {
	if ( ! req.body.username )
	    return res.status(412).json({status: 412 , message: constants.loginConstants.INVALID_LOGIN_USERNAME_NO_FIELD});
	if ( req.body.username.length < 5 )
	    return res.status(412).json({ status: 312 , message: constants.loginConstants.INVALID_LOGIN_USERNAME_LENGTH });
	return next();
    }
    static EmailValidator(req,res,next) {
	if ( ! req.body.email )
	    return res.status(412).json({ status: 412, message: constants.authConstants.NO_EMAIL_FIELD });
	if ( ! constants.registerConstants.EMAIL_REGEXP.test(req.body.email) )
	    return res.status(412).json({ status: 412, message: constants.authConstants.INVALID_EMAIL });
	return next();
    }

    static CheckAvatar(req,res,next) {
	if ( ! req.body.avatar )
	    return res.status(412).json({
		status: 412,
		message: constants.authConstants.NO_AVATAR_FIELD
	    });
	return next();
    }

    static CheckCountry(req,res,next) {

	if ( ! req.body.country )
	    return res.status(412).json({
		status : 412,
		message : constants.authConstants.NO_COUNTRY_FIELD
	    });

	if ( req.body.country.length < 2 )
	    return res.status(412).json({
		status: 412,
		message : constants.authConstants.INVALID_COUNTRY_LENGTH
	    });

	return next();
    }

    static CheckInterest(req,res,next) {
	if ( ! req.body.interests )
	    return res.status(412).json({
		status  : 412,
		message : constants.authConstants.NO_INTEREST_FIELD
	    });

	if ( ! Array.isArray(req.body.interests) )
	    return res.status(412).json({
		status: 412,
		message: constants.authConstants.NO_ARRAY_INTERESTS
	    });

	if ( req.body.interests.length === 0 )
	    return res.status(412).json({
		status  : 412,
		message : constants.authConstants.NO_INTEREST_LENGTH
	    });

	return next();
    }

};
