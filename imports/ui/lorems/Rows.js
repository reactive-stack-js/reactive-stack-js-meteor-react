import React, {Component} from 'react';
import moment from "moment";
import _ from "lodash";

class Rows extends Component {
	selectRow(lorem) {
		this.props.onSelectRow(lorem);
	}

	render() {
		let filteredLorems = this.props.lorems;
		if (!filteredLorems) {
			return (<tr>
				<td>Nothing to show here...</td>
			</tr>);
		}

		let rowId = (this.props.page - 1) * this.props.pageSize + 1;
		_.each(filteredLorems, (m) => m.rowId = rowId++);

		return filteredLorems.map((lorem) => {
			let selected = this.props.selected;
			let rowClass = selected && lorem.itemId === selected.itemId ? 'active' : '';

			return (
				<tr key={Math.random()} className={rowClass} onClick={() => this.selectRow(lorem)}>
					<td>{lorem.rowId}</td>
					<td>{lorem.iteration}</td>
					<td>{lorem.firstname} {lorem.lastname}</td>
					<td>{lorem.username}</td>
					<td>{lorem.email}</td>
					<td>{lorem.rating}</td>
					<td>{lorem.species}</td>
					<td>
						{_.truncate(lorem.description, {
							'length': 75,
							'separator': ' '
						})}
					</td>
					<td>{moment(lorem.createdAt).format('YYYY/MM/DD HH:mm:ss')}</td>
				</tr>
			);
		});
	}
}

export default Rows;
