var keystone = require('keystone');
var Types = keystone.Field.Types;
// Twilio Credentials
// const accountSid = 'ACb3ecae2bd2fd6aa16ad96cd059b2fb86';
// const authToken = 'your_auth_token';
const accountSid = 'AC101f192b834c82eafcdfb9d1f18e522e';
const authToken = '35343a2ef0f3fb6368c0e3f2c86096e8';
// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

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
	email: { type: Types.Email, required: false },
	phone: { type: String },
	enquiryType: { type: Types.Select, options: [
		{ value: 'dg', label: 'DG' },
		{ value: 'high_court', label: 'High Court' },
		{ value: 'de/pe', label: 'DE/PE' },
	] },
	message: { type: Types.Markdown, required: false},
	// geoLocation: { type: Types.Location, defaults: { country: 'India' } },
	// images: { type: Types.CloudinaryImages },
	createdAt: { type: Date, default: Date.now },
});

Enquiry.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	next();
});

Enquiry.schema.post('save', function () {
	if (!this.wasNew) {
		 this.sendNotificationSMS();
	}
});

Enquiry.schema.methods.sendNotificationSMS = function (callback) {
	if (typeof callback !== 'function') {
		callback = function () {};
	}
	var enquiry = this;
	keystone.list('User').model.find().where('isAdmin', true).exec(function (err, admins) {
		if (err) return callback(err);
		console.log(enquiry.id);
		function getSMSBody(){
			body = "Dear " + enquiry.name.first + "! Your complaint has been registered or updated. Your Enquiry ID is " + enquiry.id;
			return body;
		}

		function getPhoneNumber(){
			return enquiry.phone;
		}

		client.messages
			.create({
				to: getPhoneNumber(),
				from: '+12057193452',
				body: getSMSBody(),
			})
			.then((message) => console.log("SMS has been sent: " + message.sid));

	});
};


Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, enquiryType, createdAt, message, policeStation, priority, status';
Enquiry.register();
