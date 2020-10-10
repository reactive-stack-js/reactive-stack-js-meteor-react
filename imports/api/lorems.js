import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';
import _ from "lodash";

import {Drafts} from "./drafts";

export const Lorems = new Mongo.Collection('lorems');

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('lorems', function loremsPublication(query = {}, options = {}) {
		return Lorems.find(query, options);
	});

	Meteor.methods({
		'lorems.count'(query = {}) {
			// console.log('lorems.count', query);
			check(query, Object);
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
		},

		async 'lorem.createDraft'(loremId, userId) {
			// console.log('lorem.createDraft', loremId, userId);
			check(loremId, String);
			check(userId, String);

			loremId = new Mongo.ObjectID(loremId);
			let lorem = await Lorems.findOne({_id: loremId});

			const sourceDocumentId = loremId;
			const sourceDocumentItemId = lorem.itemId;
			let existing = await Drafts.find({sourceDocumentId}).fetch();
			console.log('lorem.createDraft 1 existing', existing);
			if (!_.isEmpty(existing)) {
				const draft = {collectionName: "lorems", sourceDocumentId, sourceDocumentItemId};
				draft.document = _.omit(lorem, ['_id', 'updatedAt', 'updatedBy']);
				draft.meta = {};
				draft.createdBy = userId;
				existing = await Draft.insert(draft);
			}
			console.log('lorem.createDraft 2 existing', existing);
			return existing._id;
		},

		async 'lorem.saveDraft'(draftId, userId) {
			// console.log('lorem.saveDraft', id);
			check(draftId, String);
			draftId = new Mongo.ObjectID(draftId);
			let draft = await Drafts.findOne({_id: draftId});
			if (_.isEmpty(draft)) console.log('QUE???');

			const document = _.omit(draft.document, ['_id', 'createdAt']);

			let max = await Lorems
				.find({itemId: document.itemId})
				.sort({iteration: -1})
				.limit(1);
			max = _.first(max);
			await Lorems.updateOne({_id: max._id}, {$set: {isLatest: false}});

			document.isLatest = true;
			document.iteration = max.iteration + 1;
			document.createdBy = userId;
			document.createdAt = new Date();

			await Drafts.deleteOne({_id: draftId});
			const dbDocument = await Lorems.insert(document);
			return dbDocument._id;
		}

	});
}