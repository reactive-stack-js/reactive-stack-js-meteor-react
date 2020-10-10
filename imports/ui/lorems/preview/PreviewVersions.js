import React, {Component} from "react";
import _ from "lodash";

import PreviewVersionsRow from "./PreviewVersionsRow.js";

class PreviewVersions extends Component {

	constructor(props) {
		super(props);
		this.onSelectVersion = this.onSelectVersion.bind(this);
	}

	onSelectVersion(lorem) {
		this.props.onSelectVersion(lorem);
	}

	render() {
		let versions = this.props.selectedVersions;
		if (_.isEmpty(versions)) {
			return (
				<span><i className="fa fa-refresh fa-spin"/> Loading versions...</span>
			);
		}

		return (
			<table width="100%" border="1" cellSpacing="0" cellPadding="10">
				<thead>
				<tr>
					<th align="left">V.</th>
					<th align="left">Rating</th>
					<th align="left">Created At</th>
				</tr>
				</thead>

				<tbody>
				<PreviewVersionsRow selected={this.props.selected} selectedVersions={this.props.selectedVersions} onSelectVersion={this.onSelectVersion}/>
				</tbody>
			</table>
		);
	}
}

export default PreviewVersions;
