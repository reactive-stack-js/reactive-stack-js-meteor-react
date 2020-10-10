import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';
import _ from "lodash";

export const Lorems = new Mongo.Collection('lorems');

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('lorems', function loremsPublication(query = {}, options = {}) {
		return Lorems.find(query, options);
	});

	Meteor.methods({
		'lorems.count'(query = {}) {
			// console.log('lorems.count', query);
			return Lorems.find(query).count();
		},

		async 'lorems.iterations'(itemId) {
			// console.log('lorems.iterations', itemId);
			check(itemId, String);
			return await Lorems.find({itemId}, {sort: {iterations: -1}}).fetch();
		},

		async 'lorem.instance'(query) {
			// console.log('lorem.instance', query);
			check(query, Object);
			let instance = await Lorems.find(query).fetch();
			if (_.isArray(instance)) instance = _.first(instance);
			return instance;
		}
	});
}