import React, {Component} from "react";
import moment from "moment";

class PreviewVersionsRow extends Component {
	render() {
		return this.props.selectedVersions.map((lorem) => {
			let selected = this.props.selected;
			let rowClass = selected && lorem._id._str === selected._id._str ? "active" : "";

			return (
				<tr key={Math.random()} className={rowClass} onClick={() => this.props.onSelectVersion(lorem)}>
					<td>{lorem.iteration}</td>
					<td>{lorem.rating}</td>
					<td>{moment(lorem.createdAt).format("YYYY/MM/DD HH:mm:ss")}</td>
				</tr>
			);
		});
	}
}

export default PreviewVersionsRow;
