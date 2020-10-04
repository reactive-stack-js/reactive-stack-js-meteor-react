import React, {Component} from 'react';
import {Mongo} from "meteor/mongo";
import {Meteor} from "meteor/meteor";
import {withTracker} from 'meteor/react-meteor-data';

import _ from "lodash";
import moment from "moment";
import jsonDiff from "json-diff";

import {Lorems} from '../../api/lorems.js';

import './Lorem.css';

let initialLoaded = false;
let INITIAL;
const SPECIES = ['Human', 'Draenei', 'Dryad', 'Dwarf', 'Gnome', 'Worgde'];
const _cleanDiff = (diff) => _.omit(diff, [
	'_id', 'isLatest',
	'isDraft', 'isDraft__added',
	'meta', 'meta__added',
	'updatedAt', 'updatedAt__added',
	'updatedBy', 'updatedBy__added'
]);

class LoremComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {};

		this.closeDialog = this.closeDialog.bind(this);
		this.saveLorem = this.saveLorem.bind(this);
		this.isDisabled = this.isDisabled.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onChange = this.onChange.bind(this);
	}

	closeDialog() {
		const diff = _cleanDiff(jsonDiff.diff(INITIAL, this.props.lorem));
		if (!_.isEmpty(diff)) {
			alert('Changes detected... still closing since out of POC scope.');
		}

		let id = this.props.lorem._id._str;
		Meteor.call('lorem.cancel', id, (error, result) => {
			if (error) console.error(error);
			window.location.href = '/';
		});
	}

	saveLorem() {
		const diff = _cleanDiff(jsonDiff.diff(INITIAL, this.props.lorem));
		if (_.isEmpty(diff)) alert('No changes detected... still saving since out of POC scope.');

		let id = this.props.lorem._id._str;
		Meteor.call('lorem.save', id, (error, result) => {
			if (error) console.error(error);
			window.location.href = '/';
		});

	}

	isDisabled(field) {
		// console.log(' - isDisabled', field);
		let lorem = this.props.lorem;
		if (lorem) {
			let meta = lorem.meta;
			if (meta) {
				field = _.get(meta, field);
				if (field) {
					let user = _.get(field, 'user');
					return user !== Meteor.user()._id ? "disabled" : "";
				}
			}
		}
		return "";
	}

	onFocus(field) {
		// console.log(' - onFocus', field, this.isDisabled(field));
		if (this.isDisabled(field)) return;
		let id = this.props.lorem._id._str;
		Meteor.call('lorem.focus', {id, field}, (error, result) => {
			if (error) console.error(error);
		});
	}

	onBlur(field) {
		// console.log(' - onBlur', field);
		let id = this.props.lorem._id._str;
		Meteor.call('lorem.blur', {id, field}, (error, result) => {
			if (error) console.error(error);
		});
	}

	async onChange(value, field) {
		let id = this.props.lorem._id._str;
		Meteor.call('lorem.change', {id, field, value}, (error, result) => {
			if (error) console.error(error);
		});
	}

	renderSelectOptions() {
		return SPECIES.map((species) => {
			return (
				<option key={Math.random()} value={species}>{species}</option>
			);
		});
	}

	render() {
		if (!this.props.currentUser) return (<p style={{padding: 20}}>Sorry, you have to sign in to see the data.</p>);
		if (!this.props.ready) return (<p style={{padding: "20px"}}>Loading data...</p>);
		if (!this.props.lorem || !this.props.lorem.isDraft) window.location.href = '/';

		let lorem = this.props.lorem;
		let updatedAt = _.get(lorem, 'updatedAt');

		if (!initialLoaded) {
			initialLoaded = true;
			Meteor.call('lorem.instance', {
				isDraft: null,
				itemId: lorem.itemId,
				iteration: lorem.iteration
			}, (error, result) => {
				if (error) console.error(error);
				INITIAL = result;
			});
		}

		return (
			<div id="lorem-component">
				<div id="lorem-form">
					<form>
						<table width="100%" cellSpacing="0" cellPadding="10">
							<tbody>
							<tr>
								<td width="60" className="editorRow"><label>Name:</label></td>
								<td style={{whiteSpace: "nowrap"}}>
									<input className="editorField" type="text" value={lorem.firstname} disabled={this.isDisabled('firstname')} onFocus={() => this.onFocus('firstname')} onBlur={() => this.onBlur('firstname')} onChange={(e) => this.onChange(e.target.value, 'firstname')}/>
									&nbsp;
									<input className="editorField" type="text" value={lorem.lastname} disabled={this.isDisabled('lastname')} onFocus={() => this.onFocus('lastname')} onBlur={() => this.onBlur('lastname')} onChange={(e) => this.onChange(e.target.value, 'lastname')}/>
								</td>
							</tr>
							<tr>
								<td className="editorRow"><label>E-mail:</label></td>
								<td>
									<input className="editorField" type="text" value={lorem.email} disabled={this.isDisabled('email')} onFocus={() => this.onFocus('email')} onBlur={() => this.onBlur('email')} onChange={(e) => this.onChange(e.target.value, 'email')}/>
								</td>
							</tr>
							<tr>
								<td className="editorRow"><label>Species:</label>{lorem.species}</td>
								<td>
									<select className="editorField"
									        value={lorem.species}
									        disabled={this.isDisabled('species')}
									        onFocus={() => this.onFocus('species')}
									        onBlur={() => this.onBlur('species')}
									        onChange={(e) => this.onChange(e.target.value, 'species')}>
										{this.renderSelectOptions()}
									</select>
								</td>
							</tr>
							<tr>
								<td className="editorRow"><label>Rating:</label></td>
								<td>
									<input className="editorField" type="number" value={lorem.rating} disabled={this.isDisabled('rating')} onFocus={() => this.onFocus('rating')} onBlur={() => this.onBlur('rating')} onChange={(e) => this.onChange(e.target.value, 'rating')}/>
								</td>
							</tr>
							<tr>
								<td className="editorRow"><label>Description:</label></td>
								<td>
									<textarea style={{
										width: "413px",
										height: "150px"
									}}
									          value={lorem.description}
									          disabled={this.isDisabled('description')}
									          onFocus={() => this.onFocus('description')}
									          onBlur={() => this.onBlur('description')}
									          onChange={(e) => this.onChange(e.target.value, 'description')}/>
								</td>
							</tr>
							</tbody>
						</table>
					</form>
				</div>

				<div id="lorem-meta">
					<p align="right">
						Draft created on
						<b>{moment(lorem.createdAt).format('YYYY/MM/DD HH:mm:ss')}</b>
						&nbsp;
						using <b>version {lorem.iteration}</b> of <b>{lorem.username}</b>.
						{
							updatedAt
								? <span><br/>Last update at <b>{moment(updatedAt).format('YYYY/MM/DD HH:mm:ss')}</b>.</span>
								: ''
						}
					</p>
				</div>

				<div id="lorem-controls">
					<button onClick={this.closeDialog}>Close</button>
					&nbsp;&nbsp;
					<button onClick={this.saveLorem}>Save</button>
				</div>
			</div>
		);
	}
}

export default withTracker((props) => {
	let id = props.match.params.id;
	let filter = {_id: new Mongo.ObjectID(id)};
	const subscription = Meteor.subscribe('lorems', filter);

	let lorem = _.first(Lorems.find(filter).fetch());
	let currentUser = Meteor.user();

	return {
		ready: subscription.ready(),
		lorem,
		currentUser,
	};
})(LoremComponent);
