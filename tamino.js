var pamina = require('pamina')
	, util = require('util')
	, events = require('events')
	, handlers = {}

function hasNoValue(val) {
	return val === undefined
}

function Tamino(req) {
	if(!(this instanceof Tamino)) {
		return new Tamino(req)
	}

	var me = this

	function emitInvalid() {
		me.emit('invalid')
	}

	function emitResult(err, result) {
		if(err) return me.emit('error', err)
		me.emit('result', result)
	}

	function execute() {
		var handler = handlers[req.path]	
		if(!handler) return me.emit('not found')

		function executeHandler(vals) {
			vals.push(emitResult)

			try {
				handler.apply({}, vals)
			}
			catch(ex) {
				me.emit('error', ex)
			}
		}

		var binder = pamina(req, handler)
		binder.on('valid', executeHandler)
		binder.on('invalid', emitInvalid)
	}
	events.EventEmitter.call(me)

	process.nextTick(execute)
}
util.inherits(Tamino, events.EventEmitter)

function add(path, fn) {
	handlers[path] = fn
}


module.exports = Tamino
module.exports.add = add