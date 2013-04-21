var sarastro = require('sarastro')
	, util = require('util')
	, events = require('events')

function hasNoValue(val) {
	return val === undefined
}

function Pamina(req, handler) {
	if(!(this instanceof Pamina)) {
		return new Pamina(req, handler)
	}

	var me = this
	me._req = req

	function execute() {
		var vals = handler.args.map(me.resolveValue, me)

		if(vals.some(hasNoValue)) {
			me.emit('invalid')
		} else {
			me.emit('valid', vals)
		}
	}
	events.EventEmitter.call(me)

	process.nextTick(execute)
}
util.inherits(Pamina, events.EventEmitter)

Pamina.prototype.resolveValue = function(arg) {
	var val
	if(this._req.params) {
		val = this._req.params[arg]
	}
	if(hasNoValue(val)) {
		val = this._req.query[arg]
	}
	return val
}


module.exports = Pamina