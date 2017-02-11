var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

var Enquiry = new keystone.List('Enquiry', {
	nocreate: false,
	noedit: false,
});

Enquiry.add({
	name: { type: Types.Name, required: true },
	status: { type: Types.Select, options: [
		{ value: 'pending', label: 'Pending' },
		{ value: 'done', label: 'Done' },
	], default: 'pending' },
	policeStation: { type: Types.Select, options: [
		{ value: 'ranjhi', label: 'Ranjhi' },
		{ value: 'vijaynagar', label: 'Vijaynagar' },
	] },
	priority: { type: Types.Select, options: [
		{ value: 'normal', label: 'Normal' },
		{ value: 'important', label: 'Important' },
		{ value: 'urgent', label: 'Urgent' },
	] },
	email: { type: Types.Email, required: true, default: 'nil' },
	phone: { type: String },
	enquiryType: { type: Types.Select, options: [
		{ value: 'dg', label: 'DG' },
		{ value: 'high_court', label: 'High Court' },
		{ value: 'de/pe', label: 'DE/PE' },
	] },
	message: { type: Types.Markdown, required: true, default: 'nil' },
	createdAt: { type: Date, default: Date.now },
});

Enquiry.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	next();
});

Enquiry.schema.post('save', function () {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});

// Enquiry.schema.methods.sendNotificationEmail = function (callback) {
// 	if (typeof callback !== 'function') {
// 		callback = function () {};
// 	}
// 	var enquiry = this;
// 	keystone.list('User').model.find().where('isAdmin', true).exec(function (err, admins) {
// 		if (err) return callback(err);
// 		new keystone.Email({
// 			templateExt: 'hbs',
// 			templateEngine: require('express-handlebars'),
// 			templateName: 'enquiry-notification',
// 		}).send({
// 			to: admins,
// 			from: {
// 				name: 'Police Utility',
// 				email: 'contact@police-utility.com',
// 			},
// 			subject: 'New Enquiry for Police Utility',
// 			enquiry: enquiry,
// 		}, callback);
// 	});
// };

Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, enquiryType, createdAt, message, policeStation, priority, status';
Enquiry.register();
