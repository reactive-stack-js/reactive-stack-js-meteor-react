import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {useHistory} from 'react-router-dom';

import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {withTracker} from 'meteor/react-meteor-data';

import _ from "lodash";

import {Lorems} from '../../api/lorems.js';

import './Lorems.css';
import Rows from './Rows.js';
import Preview from './preview/Preview.js';

const MIN_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 25;
const COLUMNS = ['iteration', 'firstname', 'lastname', 'email', 'rating', 'description'];

const filter = new ReactiveVar({isLatest: true});
const sort = new ReactiveVar({createdAt: -1});
const skip = new ReactiveVar({skip: 0});
const size = new ReactiveVar({size: 10});

// App component - represents the whole app
class LoremsComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			page: 1,
			pageSize: 10,
			pageCount: 0,
			query: '',
			selected: null,
			selectedVersions: []
		};

		this.refreshPage = this.refreshPage.bind(this);
		this.updateQuery = this.updateQuery.bind(this);
		this.resetQuery = this.resetQuery.bind(this);
		this._toggleSortingHelper = this._toggleSortingHelper.bind(this);
		this.toggleSorting = this.toggleSorting.bind(this);
		this.pageSizeBackward = this.pageSizeBackward.bind(this);
		this.pageSizeForward = this.pageSizeForward.bind(this);
		this.pageBackward = this.pageBackward.bind(this);
		this.pageForward = this.pageForward.bind(this);
		this.selectRow = this.selectRow.bind(this);
		this.onSelectVersion = this.onSelectVersion.bind(this);
		this.getIcon = this.getIcon.bind(this);
		this.editLorem = this.editLorem.bind(this);
	}

	toggleHideCompleted() {
		this.setState({
			hideCompleted: !this.state.hideCompleted,
		});
	}

	async refreshPage() {
		await skip.set({skip: (this.state.page - 1) * this.state.pageSize});
		await size.set({size: this.state.pageSize});
	}

	async updateQuery(event) {
		let query = event.target.value;
		let or = _.map(COLUMNS, (column) => {
			let q = {};
			_.set(q, column, {$regex: query});
			return q;
		});
		let filtering = {
			isLatest: true,
			$or: or
		};
		await this.setState({query});
		await filter.set(filtering);
		this.refreshPage();
	}

	async resetQuery() {
		await this.setState({query: ''});
		await filter.set({isLatest: true});
		this.refreshPage();
	}

	async _toggleSortingHelper(label) {
		let sorting = sort.get();
		let sortingLabel = _.get(sorting, label, false);
		if (sorting && sortingLabel) {
			if (sortingLabel < 0) _.set(sorting, label, 1);
			else if (sortingLabel > 0) _.set(sorting, label, 0);
			else _.set(sorting, label, -1);
		} else {
			_.set(sorting, label, -1);
		}
		await sort.set(sorting);
	}

	async toggleSorting(label) {
		if (label === 'firstname') {
			await this._toggleSortingHelper('firstname');
			await this._toggleSortingHelper('lastname');
		} else {
			await this._toggleSortingHelper(label);
		}

		let sorting = sort.get();
		if (sorting['createdAt']) {
			let createdAt = sorting['createdAt'];
			delete sorting['createdAt'];
			sorting['createdAt'] = createdAt;
		}
		sorting = _.pickBy(sorting, _.identity);
		await sort.set(sorting);
		this.refreshPage();
	}

	async pageSizeBackward() {
		let pageSize = this.state.pageSize - 1;
		if (pageSize < MIN_PAGE_SIZE) {
			pageSize = MIN_PAGE_SIZE;
		}
		await this.setState({pageSize});
		await this.refreshPage();
	}

	async pageSizeForward() {
		let pageSize = this.state.pageSize + 1;
		if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
		await this.setState({pageSize});
		await this.refreshPage();
	}

	async pageBackward() {
		let page = this.state.page - 1;
		if (page < 1) page = 1;
		await this.setState({page});
		await this.refreshPage();
	}

	async pageForward() {
		let page = this.state.page + 1;
		if (page > this.state.pageSize) page = this.state.pageSize;
		await this.setState({page});
		await this.refreshPage();
	}

	async editLorem(lorem) {
		Meteor.call('lorem.draft', lorem._id._str, (error, result) => {
			if (error) return console.error(error);
			window.location.href = '/lorem/' + result;
		});
	}

	async selectRow(lorem) {
		let selected = this.state.selected;
		if (selected) {
			if (lorem.itemId === selected.itemId) {
				await this.setState({selected: null});
				await this.setState({selectedVersions: []});
				return;
			}
		}

		selected = _.cloneDeep(lorem);
		await this.setState({selected});
		await this.setState({selectedVersions: []});

		Meteor.call('lorems.iterations', selected.itemId, (error, result) => {
			this.setState({selectedVersions: result});
		});
	}

	async onSelectVersion(lorem) {
		let selected = this.state.selected;
		if (selected) {
			if (lorem._id._str === selected._id._str) return;
		}

		selected = _.cloneDeep(lorem);
		await this.setState({selected});
	}

	getIcon(label) {
		let sorting = sort.get();
		if (sorting) {
			let sortingLabel = _.get(sorting, label, false);
			if (sortingLabel) {
				if (sortingLabel < 0) return 'fa fa-long-arrow-down';
				if (sortingLabel > 0) return 'fa fa-long-arrow-up';
			}
		}
		return '';
	}

	render() {
		if (!this.props.currentUser) {
			return (
				<p style={{padding: 20}}>Sorry, you have to sign in to see the data.</p>
			);
		}

		this.state.pageCount = parseInt(this.props.totalCount / this.state.pageSize, 10) + 1;
		return (
			<div id="lorems-component">
				<div id="lorems-controls">
					Page <b>{this.state.page}</b> of <b>{this.state.pageCount}</b>
					&nbsp;
					<button disabled={this.state.page <= 1} onClick={this.pageBackward}>-</button>
					&nbsp;
					<button disabled={this.state.page >= this.state.pageCount} onClick={this.pageForward}>+</button>
					&nbsp;
					|
					&nbsp;
					Page size <b>{this.state.pageSize}</b>
					&nbsp;
					<button disabled={this.state.pageSize <= MIN_PAGE_SIZE} onClick={this.pageSizeBackward}>-</button>
					&nbsp;
					<button disabled={this.state.pageSize >= MAX_PAGE_SIZE} onClick={this.pageSizeForward}>+</button>
					&nbsp;
					|
					&nbsp;
					<input type="text" name="query" value={this.state.query} onChange={this.updateQuery}/>
					&nbsp;
					<button disabled={_.isEmpty(this.state.query)} onClick={this.resetQuery}>x</button>
				</div>

				<div id="lorems-grid">
					<table width="100%" border="1" cellSpacing="0" cellPadding="10">
						<thead>
						<tr>
							<th align="left">#</th>
							<th align="left" onClick={() => this.toggleSorting('iteration')} className="nowrap">
								V. <i className={this.getIcon('iteration')}/>
							</th>
							<th align="left" onClick={() => this.toggleSorting('firstname')} className="nowrap">
								Name <i className={this.getIcon('firstname')}/>
							</th>
							<th align="left" onClick={() => this.toggleSorting('username')} className="nowrap">
								Username <i className={this.getIcon('username')}/>
							</th>
							<th align="left" onClick={() => this.toggleSorting('email')} className="nowrap">
								Email <i className={this.getIcon('email')}/>
							</th>
							<th align="left" onClick={() => this.toggleSorting('rating')} className="nowrap">
								Rating <i className={this.getIcon('rating')}/>
							</th>
							<th align="left" onClick={() => this.toggleSorting('species')} className="nowrap">
								Species <i className={this.getIcon('species')}/>
							</th>
							<th align="left" onClick={() => this.toggleSorting('description')} className="nowrap">
								Description <i className={this.getIcon('description')}/>
							</th>
							<th align="left" onClick={() => this.toggleSorting('createdAt')} className="nowrap">
								Created At <i className={this.getIcon('createdAt')}/>
							</th>
						</tr>
						</thead>

						<tbody>
						<Rows
							lorems={this.props.lorems}
							page={this.state.page}
							pageSize={this.state.pageSize}
							selected={this.state.selected}
							onSelectRow={this.selectRow}
						/>
						</tbody>
					</table>
				</div>

				<div id="lorems-preview">
					<Preview selected={this.state.selected} selectedVersions={this.state.selectedVersions} onEditLorem={this.editLorem} onSelectVersion={this.onSelectVersion}/>
				</div>
			</div>
		);
	}
}

export default withTracker((props) => {
	Meteor.subscribe('lorems', filter.get());

	console.log('query attributes', {
		filter: filter.get(),
		sort: sort.get(),
		skip: skip.get(),
		limit: size.get()
	})

	console.log('lorems', Lorems.find({}).fetch())

	return {
		lorems: Lorems.find(
			filter.get(), {
				sort: sort.get(),
				skip: skip.get().skip,
				limit: size.get().size
			}).fetch(),
		totalCount: Lorems.find(filter.get()).count(),
		currentUser: Meteor.user(),
	};
})(LoremsComponent);
