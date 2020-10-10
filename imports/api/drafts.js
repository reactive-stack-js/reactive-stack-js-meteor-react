import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';
import _ from "lodash";

export const Drafts = new Mongo.Collection('drafts');

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('drafts', function loremsPublication(query = {}, options = {}) {
		return Drafts.find(query, options);
	});

// Meteor.subscribe('drafts', {isLatest: true});
// Meteor.subscribe('drafts', {itemId: someItemIdValue});

	Meteor.methods({
		async 'draft.instance'(query) {
			// console.log('draft.instance', query);
			check(query, Object);
			let instance = await Drafts.find(query).fetch();
			if (_.isArray(instance)) instance = _.first(instance);
			return instance;
		},

		async 'draft.focus'(params) {
			// console.log('draft.focus', params);
			check(params, Object);
			let {id, field} = params;
			check(id, String);
			check(field, String);

			id = new Mongo.ObjectID(id);
			let draft = await Drafts.find({_id: id}).fetch();
			if (_.isArray(draft)) draft = _.first(draft);

			if (!draft.isDraft) {
				// TODO: not allowed!
			}

			let user = Meteor.user()._id;
			let meta = _.get(draft, 'meta', null);
			if (meta) {
				if (_.get(meta, field)) return false;
				_.each(meta, (val, id) => {
					if (_.get(val, 'user', false) === user) {
						meta = _.omit(meta, id);
					}
				});
			} else {
				meta = {};
			}
			_.set(meta, field, {user});
			await Drafts.update(id, {$set: {meta}});
			// console.log('draft.focus', {user, meta: draft.meta});

			return true;
		},

		async 'draft.blur'(params) {
			// console.log('draft.blur', params);
			check(params, Object);
			let {id, field} = params;
			check(id, String);
			check(field, String);

			id = new Mongo.ObjectID(id);
			let draft = await Drafts.find({_id: id}).fetch();
			if (_.isArray(draft)) draft = _.first(draft);

			if (!draft.isDraft) {
				// TODO: not allowed!
			}

			let meta = _.get(draft, 'meta', null);
			if (meta) {
				let curr = _.get(meta, field);
				if (curr) {
					let user = _.get(curr, 'user');
					if (user !== Meteor.user()._id) return false;
					let metaData = _.omit(meta, field);
					await Drafts.update(id, {$set: {meta: metaData}});
				}
			}
			return true;
		},

		async 'draft.change'(params) {
			// console.log('draft.change', params);
			check(params, Object);
			let {id, field, value} = params;
			check(id, String);
			check(field, String);

			id = new Mongo.ObjectID(id);
			let draft = await Drafts.find({_id: id}).fetch();
			if (_.isArray(draft)) draft = _.first(draft);

			if (!draft.isDraft) {
				// TODO: not allowed!
			}

			let updater = {
				updatedBy: Meteor.user()._id,
				updatedAt: new Date()
			};

			_.set(updater, field, value);

			let result = await Drafts.update(id, {$set: updater});
			return result === 1;
		},

		async 'draft.draft'(id) {
			// console.log('draft.draft', id);
			check(id, String);
			id = new Mongo.ObjectID(id);
			let lorem = await Drafts.find({_id: id}).fetch();
			if (_.isArray(lorem)) lorem = _.first(lorem);

			let current = await Drafts.find({itemId: lorem.itemId, isDraft: true}).fetch();
			if (!_.isEmpty(current)) {
				if (_.isArray(current)) current = _.first(current);
				return current._id._str;
			}

			let draft = _.omit(lorem, ['_id', 'meta', 'updatedAt', 'updatedBy', 'createdAt', 'createdBy']);
			draft.isDraft = true;
			draft.isLatest = false;
			draft.createdAt = new Date();
			draft.createdBy = Meteor.user()._id;
			draft._id = new Mongo.ObjectID();

			let draftId = await Drafts.insert(draft);
			return draftId;
		},

		async 'draft.cancel'(id) {
			// console.log('draft.cancel', id);
			check(id, String);
			id = new Mongo.ObjectID(id);
			Drafts.remove(id);
			return true;
		},

		async 'draft.save'(id) {
			// console.log('draft.save', id);
			check(id, String);
			id = new Mongo.ObjectID(id);
			let draft = await Drafts.find({_id: id, isDraft: true}).fetch();
			if (_.isEmpty(draft)) console.log('QUE???');
			if (_.isArray(draft)) draft = _.first(draft);

			let max = await Drafts.find({itemId: draft.itemId, isLatest: true}).fetch();
			if (_.isArray(max)) max = _.first(max);

			await Drafts.update({_id: max._id}, {$set: {isLatest: false}});
			draft = _.omit(draft, ['meta', 'updatedAt', 'updatedBy', 'createdAt', 'createdBy', 'isDraft']);
			draft.isLatest = true;
			draft.iteration = max.iteration + 1;
			draft.createdAt = new Date();
			draft.createdBy = Meteor.user()._id;
			await Drafts.update({_id: draft._id}, draft);
			return true;
		}

	});
}