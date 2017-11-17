'use explicit'

module.exports = class hndleCmdLine {
	constructor( args ){
		//super();
		//console.dir(args);
		this._args = args;
	}

	get ( _opt ) {
		let optV = "";
		let found_GetNext = false;
		this._args.forEach(function (val, index, array) {
			if ( found_GetNext ) {
				optV=val;	
			}
			found_GetNext = (val === _opt );
		});
		return (optV);
	}

	getPartOf( _opt, _delim, _idx){
		let v = this.get(_opt);
		try{
			if (v !== ""){
				v = v.split(_delim)[_idx];
			}
		} catch (err){
			v="";
		} 
		return (v);
	}

	exists( _opt ) {
		let optV = "";
		let f= false;
		this._args.forEach(function (val, index, array) {
			if (!f){
				//console.log (`compare: ${val} === ${_opt} = ${(val === _opt )}`);
				f = (val === _opt );
			}
		});
		return ( f );
	}



	toString(){
		let s = "";
		this._args.forEach(function (val, index, array) {
			s = s + val + " ";
		});	

		return (s);
	}


}