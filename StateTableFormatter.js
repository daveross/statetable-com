var OutputBuffer = function() {

	this.output = '';

	this.render = function() {
		return this.output;
	};

	this.length = function() {
		return this.output.length;
	};

	this.quote = function(value, doublequote) {

		if(doublequote === undefined) {
			doublequote = true;
		}

		if(doublequote) {
			return '"' + value + '"';
		}
		else {
			return "'" + value + "'";
		}
	};

};

exports.CSV = function() {

	this.output_buffer = new OutputBuffer();
	this.filename = 'state_table.csv';

	this.header = function(headers) {
		this.output_buffer.output += headers.join(',') + "\n";
		this.headers = headers;
	};

	this.row = function(data) {
		var row = [];
		for(var index in this.headers) {
			var header = this.headers[index];
			row.push(this.output_buffer.quote(data[header]));
		}
		row = row.join(',') + "\n";
		this.output_buffer.output += row;
	};

	this.footer = function() {
		// Do nothing
	};

};

exports.SQL = function() {

	this.output_buffer = new OutputBuffer();
	this.filename = 'state_table.sql';

	this.header = function(headers) {
		var header_index;
		this.output_buffer.output += "-- State Table courtesy statetable.com\n\n";
		this.output_buffer.output += 'CREATE TABLE state (';
		for(header_index in headers) {
			var header = headers[header_index];
			var dataType;

			if(header_index > 0) {
				this.output_buffer.output += ', ';
			}
			switch(header) {
				case 'id':
				case 'sort':
					dataType = 'integer';
					break;
				default:
					dataType = 'varchar(255)';
			}

			this.output_buffer.output += header + ' ' + dataType;
		}

		this.output_buffer.output += ");\n";
		this.headers = headers;
	};

	this.row = function(data) {

		var sql = '';
		var row = [];
		var header_index;

		sql += "INSERT INTO state (";
		sql += this.headers.join(',');
		sql += ") VALUES (";

		for(header_index in this.headers) {
			var header = this.headers[header_index];
			row.push(this.output_buffer.quote((data[header] || ''), false).trim());
		}

		sql += row.join(',') + ");\n";
		this.output_buffer.output += sql;

	};

	this.footer = function() {
		// Do nothing
	};

};

exports.SELECT = function() {

	var option_value;

	this.output_buffer = new OutputBuffer();
	this.filename = 'state_table.html';

	this.header = function(headers) {
		this.output_buffer.output += '<select>';
	};

	this.row = function(data) {

		if(data['abbreviation'] && '' !== data['abbreviation']) {
			option_value = data['abbreviation'];
		}
		else {
			option_value = data['name'];
		}

		var row = '<option value="' + option_value + '">' + data['name'] + "</option>\n";
		this.output_buffer.output += row;

	};

	this.footer = function() {
		this.output_buffer.output += '</select>';
	};

};

exports.PHP_ARRAY = function() {

	var option_value;

	this.output_buffer = new OutputBuffer();
	this.filename = 'state_table.php';

	this.header = function(headers) {
		this.output_buffer.output += 'array(';
	};

	this.row = function(data) {

		if(data['abbreviation'] && '' !== data['abbreviation']) {
			option_value = data['abbreviation'];
		}
		else {
			option_value = data['name'];
		}

		var row = "'" + option_value + "' => ";
		row += "'" + data['name'].replace(/'/g, '\\\'') + "',\n";
		this.output_buffer.output += row;
	};

	this.footer = function() {
		this.output_buffer.output += ');';
	};

};

exports.DRUPAL = function() {

	var option_value;

	this.output_buffer = new OutputBuffer();
	this.filename = 'state_table.txt';

	this.header = function(headers) {};

	this.row = function(data) {

		if(data['abbreviation'] && '' !== data['abbreviation']) {
			option_value = data['abbreviation'];
		}
		else {
			option_value = data['name'];
		}

		this.output_buffer.output += option_value + '|' + data['name'] + "\n";

	};

	this.footer = function() {};

};

exports.factory = function(format) {

	switch(format) {
		case 'csv':
			return new exports.CSV();
		case 'sql':
			return new exports.SQL();
		case 'select':
			return new exports.SELECT();
		case 'php_array':
			return new exports.PHP_ARRAY();
		case 'drupal':
			return new exports.DRUPAL();
		default:
			// Return nothing
	}

};