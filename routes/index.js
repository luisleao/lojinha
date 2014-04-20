'use strict';

var paypal = require('paypal-rest-sdk');
var config = {};


var email = require('../email');



// Routes

exports.index = function (req, res) {
  res.render('index', {"title": config.app.title, "products": config.products} );
};

exports.create = function (req, res) {

	var id_product = req.param('id');
	var product = config.products[id_product];

	var payment = {
		"intent": "sale",
		"payer": {
		},
		"transactions": [{
			"amount": {
				"currency": product.currency,
				"total": product.price
			},
			"description": product.title
		}]
	};

	payment.payer.payment_method = 'paypal';
	payment.redirect_urls = {
		"return_url": config.return_url.replace(":id", id_product),
		"cancel_url": config.cancel_url.replace(":id", id_product)
	};


	paypal.payment.create(payment, function (error, payment) {
		if (error) {
			console.log(error);
			res.render('error', { 'error': error, 'title': config.app.title });
		} else {
			req.session.paymentId = payment.id;

			console.log(payment);

			for (var i in payment.links) {
				var link = payment.links[i];
				if (link.method === 'REDIRECT') {
					return res.redirect(link.href);
				}
			}

			res.render('create', { 'payment': payment, 'title': config.app.title });
		}
	});
};

exports.execute = function (req, res) {
	var paymentId = req.session.paymentId;
	var payerId = req.param('PayerID');

	var id_product = req.param('id');
	var product = config.products[id_product];

	console.log("PRODUTO COMPRADO", product)


	var details = { "payer_id": payerId };
	var payment = paypal.payment.execute(paymentId, details, function (error, payment) {
		if (error) {
			console.log(error);
			res.render('error', { 'error': error, 'title': config.app.title });
		} else {

			// notificar compra realizada
			email.send_payment(product, payment);

			res.render('execute', { 'payment': payment, 'title': config.app.title });
		}
	});
};

exports.cancel = function (req, res) {
  res.render('cancel', {'title': config.app.title});
};



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
};