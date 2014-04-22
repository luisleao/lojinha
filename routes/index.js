'use strict';

var paypal = require('paypal-rest-sdk');
var config = {};

var PayPalEC = require('paypal-ec');
var ec;

var opts = {
	sandbox : true,
	version : '92.0'
};


var email = require('../email');



var getProductParams = function(id_product) {

	var product = config.products[id_product];

	return {
		returnUrl : config.return_url.replace(":id", id_product),
		cancelUrl : config.cancel_url.replace(":id", id_product),

		PAYMENTREQUEST_0_PAYMENTACTION   : 'Sale',
		PAYMENTREQUEST_0_AMT             : product.price,
		PAYMENTREQUEST_0_CURRENCYCODE    : product.currency,

		PAYMENTREQUEST_0_DESC            : product.title,

		NOSHIPPING                       : '1',
		LOCALECODE                        : 'BR',
		HDRIMG                           : config.app.hdrimg,
		BRANDNAME                        : config.app.title,


		SOLUTIONTYPE                     : 'sole',
		//L_PAYMENTREQUEST_0_ITEMCATEGORY0 : 'Digital',
		L_PAYMENTREQUEST_0_NAME0         : product.title,
		L_PAYMENTREQUEST_0_AMT0          : product.price,
		L_PAYMENTREQUEST_0_QTY0          : '1'


	}

}


// Routes

exports.index = function (req, res) {
  res.render('index', {"title": config.app.title, "products": config.products} );
};

exports.create = function (req, res, next) {
	var id_product = req.param('id');


	var params = getProductParams(id_product);
		params.METHOD = "SetExpressCheckout";
		params.USERACTION = "COMMIT";


	ec.set( params, function ( error, data ){
		console.log(error);

		if ( error ) { console.log(error); return res.render('error', { 'error': error.toString(), 'title': config.app.title }); }//next( error );

		console.log(data);
		res.redirect( data.PAYMENTURL );
	});

};






exports.execute = function (req, res, next) {
	var id_product = req.param('id');
	var product = config.products[id_product];


	var params = getProductParams(id_product);
		params.TOKEN   = req.query.token;
		params.PAYERID = req.query.PayerID;


	ec.do_payment( params, function ( error, payment_result ){
		if ( error ) { console.log(error); return res.render('error', { 'error': error.toString(), 'title': config.app.title }); }//next( error );

		console.log("DO_PAYMENT: ", payment_result);

		// redirecionar para /:id/status
		res.redirect( '../status?token=' + req.query.token );

    });

};


exports.status = function (req, res, next) {
	var id_product = req.param('id');
	var product = config.products[id_product];

	//TODO: verificar CHECKOUTSTATUS: 'PaymentActionCompleted'

	ec.get_details({ token : req.query.token }, function ( error, payment_details ){
		if ( error ) { console.log(error); return res.render('error', { 'error': error.toString(), 'title': config.app.title }); }//next( error );
		console.log("GET_DETAILS: ", payment_details);
		email.send_payment(product, null, payment_details);
		res.render('status', { 'product': product, 'payment_details': payment_details, 'title': config.app.title });
	});

};




exports.cancel = function (req, res) {
	res.render('cancel', {'title': config.app.title});
};








// exports.execute_normal_payment = function (req, res) {
// 	var paymentId = req.session.paymentId;
// 	var payerId = req.param('PayerID');

// 	var id_product = req.param('id');
// 	var product = config.products[id_product];


// 	console.log("PRODUTO COMPRADO", product)


// 	var details = { "payer_id": payerId };
// 	var payment = paypal.payment.execute(paymentId, details, function (error, payment) {
// 		if (error) {
// 			console.log(error);
// 			res.render('error', { 'error': error, 'title': config.app.title });
// 		} else {

// 			// notificar compra realizada
// 			email.send_payment(product, payment);

// 			res.render('execute', { 'payment': payment, 'title': config.app.title });
// 		}
// 	});
// };




// exports.create_normal_payment = function (req, res, next) {

// 	var id_product = req.param('id');
// 	var product = config.products[id_product];


// 	var payment = {
// 		"intent": "sale", //sale
// 		"payer": {
// 		},

// 		"transactions": [{
// 			"amount": {
// 				"currency": product.currency,
// 				"total": product.price
// 			},

// 			"description": product.title,
// 			"noshipping": 1,
// 			"localecode": "BR",
// 			"hdrimg": product.picture,
// 			"logoimg": config.app.logoimg,
// 			"brandname": config.app.title			
// 		}]
// 	};

// 	payment.payer.payment_method = 'paypal';
// 	payment.redirect_urls = {
// 		"return_url": config.return_url.replace(":id", id_product),
// 		"cancel_url": config.cancel_url.replace(":id", id_product)
// 	};


// 	paypal.payment.create(payment, function (error, payment) {
// 		if (error) {
// 			console.log(error);
// 			res.render('error', { 'error': error, 'title': config.app.title });
// 		} else {
// 			req.session.paymentId = payment.id;

// 			console.log(payment);

// 			for (var i in payment.links) {
// 				var link = payment.links[i];
// 				if (link.method === 'REDIRECT') {
// 					return res.redirect(link.href);
// 				}
// 			}

// 			res.render('create', { 'payment': payment, 'title': config.app.title });
// 		}
// 	});
// };



// exports.create_old = function (req, res) {
// 	var method = req.param('method');

// 	var payment = {
// 		"intent": "sale",
// 		"payer": {
// 		},
// 		"transactions": [{
// 			"amount": {
// 				"currency": req.param('currency'),
// 				"total": req.param('amount')
// 			},
// 			"description": req.param('description')
// 		}]
// 	};

// 	if (method === 'paypal') {
// 		payment.payer.payment_method = 'paypal';
// 		payment.redirect_urls = {
// 			"return_url": config.return_url,
// 			"cancel_url": config.cancel_url
// 		};
// 	} else if (method === 'credit_card') {
// 		var funding_instruments = [
// 			{
// 				"credit_card": {
// 					"type": req.param('type').toLowerCase(),
// 					"number": req.param('number'),
// 					"expire_month": req.param('expire_month'),
// 					"expire_year": req.param('expire_year'),
// 					"first_name": req.param('first_name'),
// 					"last_name": req.param('last_name')
// 				}
// 			}
// 		];
// 		payment.payer.payment_method = 'credit_card';
// 		payment.payer.funding_instruments = funding_instruments;
// 	}

// 	paypal.payment.create(payment, function (error, payment) {
// 		if (error) {
// 			console.log(error);
// 			res.render('error', { 'error': error, 'title': config.app.title });
// 		} else {
// 			req.session.paymentId = payment.id;
// 			res.render('create', { 'payment': payment, 'title': config.app.title });
// 		}
// 	});
// };




// Configuration

exports.init = function (c) {
	config = c;
	email.init(c.sendgrid);
	paypal.configure(c.api);
	ec = new PayPalEC( config.paypal_nvp, opts );
};