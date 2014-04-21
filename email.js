'use strict';

var paypal = require('paypal-rest-sdk');
var sendgrid_config = {};

var sendgrid = require('sendgrid-nodejs');
var SendGrid;



exports.send_payment = function(product, payment_result, payment_details){

	var body = "<pre>"+syntaxHighlight(product)+"\n\n\n\n"+syntaxHighlight(payment_result)+"\n\n\n\n"+syntaxHighlight(payment_details)+"</pre>";

	this.send_email(sendgrid_config.email_to, "[LOJINHA] " + product.title + " comprado!", body, true);

}

exports.init = function (c) {
	sendgrid_config = c;
	SendGrid = new sendgrid.SendGrid(sendgrid_config.sendgrid_user, sendgrid_config.sendgrid_key);
};






/**
  * Funcao geral para disparo de e-mail
  */
exports.send_email = function (to, subject, body, body_is_html) {
	// send e-mail
	if (!to || to.length == 0) {
		throw new error('Invalid email');
	}

	var new_message = {
		from: sendgrid_config.email_from,
		subject: subject
	};

	if (body_is_html) {
		new_message.html = body;
	} else {
		new_message.text = body;
	}



	var msg = new sendgrid.Email(new_message);
		msg.addTo(to);
	
	SendGrid.send(msg, function(err, result) {
		console.log("SENDGRID RESULT ");
		console.log(err);
		console.log(result);
	});

}




function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }

    return json;
    /*
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
	*/
}

