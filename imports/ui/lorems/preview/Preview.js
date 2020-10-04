import React, {Component} from 'react';
import _ from "lodash";
import moment from "moment";

import './Preview.css';
import PreviewVersions from "./PreviewVersions.js";

class Preview extends Component {
	constructor(props) {
		super(props);
		this.editLorem = this.editLorem.bind(this);
		this.onSelectVersion = this.onSelectVersion.bind(this);
	}

	editLorem(lorem) {
		this.props.onEditLorem(lorem);
	}

	onSelectVersion(lorem) {
		this.props.onSelectVersion(lorem);
	}

	render() {
		let selected = this.props.selected;
		if (!selected) {
			return ('');
		}
		return (
			<div id="lorems-preview-component">
				<div id="lorems-preview-edit">
					<button className="edit" onClick={() => this.editLorem(selected)}>Edit</button>
				</div>
				<div id="lorems-preview-content">
					<p><label className="preview-label">Version:</label> {selected.iteration}</p>
					<p><label className="preview-label">Name:</label> {selected.firstname} {selected.lastname}</p>
					<p><label className="preview-label">Username:</label> {selected.username}</p>
					<p><label className="preview-label">Email:</label> {selected.email}</p>
					<p><label className="preview-label">Rating:</label> {selected.rating}</p>
					<p><label className="preview-label">Spieces:</label> {selected.species}</p>
					<p><label className="preview-label">Created&nbsp;At:</label> {moment(selected.createdAt).format('YYYY/MM/DD HH:mm:ss')}</p>
					<p><label className="preview-label">Description:</label><br/><br/>{selected.description}</p>
				</div>
				<div id="lorems-preview-grid">
					<PreviewVersions selected={this.props.selected} selectedVersions={_.orderBy(this.props.selectedVersions, ['iteration'], ['desc'])} onSelectVersion={this.onSelectVersion}/>
				</div>
			</div>
		);
	}
}

export default Preview;
