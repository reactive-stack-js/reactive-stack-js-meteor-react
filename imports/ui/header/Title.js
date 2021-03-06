import React from "react";
import "./Title.css";

export default function Title() {
	return (
		<div className="vertical-center">
			<h1>
				<b>Reactive Stack</b>
				&nbsp;
				<span className="with">with <a href="//meteor.com" target="_blank" rel="noopener noreferrer">Meteor</a> & <a href="//reactjs.org" target="_blank" rel="noopener noreferrer">React</a></span>
				&nbsp;
				<span className="github">(<a href="//github.com/reactive-stack-js/reactive-stack-js-rest-frontend-react" target="_blank" rel="noopener noreferrer">github</a>)</span>
			</h1>
		</div>
	);
}
