function EditTable( table, settings ){
  this.init = ( table, settings ) => {
    let ths, tr, td;
    
    if( settings == undefined || settings.toString() != "[object Object]" ) settings = {};
    if( table != undefined && table.toString() == "[object Object]" ){
      ths = this;
      
      ths.table = table;
      ths.table.addClass( "editTable" );
      
      ths.addRowTr = $( "<tr>" );
      ths.addRowTr.append( $( "<td>" ) );
      
      td = $( "<td>" );
      td.addClass( "bottomBorder leftBorder" );
      
      if( settings[ "title" ] != undefined ) td.html( settings[ "title" ] );
      
      ths.addRowTr.append( td );
      
      td = $( "<td>" );
      td.addClass( "allBorder icon edit" );
      td.attr( "isSelected", 0 );
      td.click( function(){
        ths.editTitle( $( this ) );
      } );
      ths.addRowTr.append( td );
      
      td = $( "<td>" );
      td.addClass( "allBorder icon add" );
      td.click( function(){
        ths.addRow();
        
        if( settings[ "addClick" ] != undefined && typeof( settings[ "addClick" ] ) == "function" ) settings[ "addClick" ]( $( this ) );
      } );
      ths.addRowTr.append( td );
      
      ths.table.append( ths.addRowTr );
    }
    
    this.index = 1;
    this.els = [];
    
    if( settings[ "handlers" ] != undefined && settings[ "handlers" ].toString() == "[object Object]" )
      this.handlers = settings[ "handlers" ];
    else this.handlers = {};
  };
  
  this.editTitle = ( sender, successFunc ) => {
    let target;
    
    target = sender.parent().children().eq( 1 );
    
    if( parseInt( sender.attr( "isSelected" ) ) == 0 ){
      sender.addClass( "selected" );
      sender.attr( "isSelected", 1 );
      this.editHTMLWithInput( target, true );
    } else {
      sender.removeClass( "selected" );
      sender.attr( "isSelected", 0 );
      this.editHTMLWithInput( target, false, successFunc );
    }
  };
  
  this.editHTMLWithInput = ( target, mode, successFunc ) => {
    let input, inputValue, inputOldValue;
    
    if( mode ){
      input = $( "<input>" );
      input.attr( "type", "text" );
      input.addClass( "editText" );
      input.attr( "oldValue", target.html() );
      input.attr( "value", target.html() );
      
      target.html( input );
      input.select();
    } else {
      input = target.children().eq( 0 );
      inputValue = input.val();
      inputOldValue = input.attr( "oldValue" );
      
      if( inputValue != "" && inputValue != inputOldValue ){
        target.html( inputValue );
        
        if( target.attr( "index" ) != undefined ) this.els[ parseInt( target.attr( "index" ) ) ] = inputValue;
        
        if( successFunc != undefined && typeof( successFunc ) == "function" ) successFunc();
      }
      else target.html( inputOldValue );
    }
  };
  
  this.addRow = ( handlers, title ) => {
    let ths, tr, td;
    
    if( handlers == undefined || handlers.toString() != "[object Object]" ) handlers = {};
    
    ths = this;
    
    tr = $( "<tr>" );
    
    td = $( "<td>" );
    td.addClass( "allBorder index" );
    td.html( ths.index );
    tr.append( td );
    
    td = $( "<td>" );
    td.addClass( "bottomBorder title" );
    td.attr( "index", ths.index - 1 );
    
    if( title == undefined ) title = this.addRowTr.children().eq( 1 ).html();
    
    td.html( title );
    this.els.push( title );
    
    if( handlers[ "titleClick" ] != undefined && typeof( handlers[ "titleClick" ] ) == "function" ) td.click( function(){
      handlers[ "titleClick" ]( $( this ) );
    } );
    else if( ths.handlers[ "titleClick" ] != undefined && typeof( ths.handlers[ "titleClick" ] ) == "function" ) td.click( function(){
      ths.handlers[ "titleClick" ]( $( this ) );
    } );
    
    tr.append( td );
    
    td = $( "<td>" );
    td.addClass( "allBorder icon edit" );
    td.attr( "isSelected", 0 );
    td.click( function(){
      let jqThs, handler;
      
      jqThs = $( this );
      
      if( handlers[ "editClick" ] != undefined && typeof( handlers[ "editClick" ] ) == "function" ) handler = () => {
        handlers[ "editClick" ]( jqThs );
      }
      else handler = () => {
        ths.handlers[ "editClick" ]( jqThs );
      }
      
      ths.editTitle( jqThs, handler );
    } );
    tr.append( td );
    
    td = $( "<td>" );
    td.addClass( "allBorder icon delete" );
    td.click( function(){
      let jqThs;
      
      jqThs = $( this );
      ths.deleteRow( jqThs );
      
      if( handlers[ "deleteClick" ] != undefined && typeof( handlers[ "deleteClick" ] ) == "function" ) handlers[ "deleteClick" ]( jqThs );
      else if( ths.handlers[ "deleteClick" ] != undefined && typeof( ths.handlers[ "deleteClick" ] ) == "function" ) ths.handlers[ "deleteClick" ]( jqThs );
    } );
    tr.append( td );
    
    ths.index++;
    tr.insertBefore( ths.addRowTr );
  };
  
  this.deleteRow = ( sender ) => {
    let i;
    
    sender.parent().remove();
    this.index--;
    i = 1;
    this.table.find( ".index" ).each( function(){
      $( this ).html( i );
      i++;
    } );
  };
  
  this.clear = () => {
    this.table.find( ".index" ).each( function(){
      $( this ).parent().remove();
    } );
    
    this.index = 1;
    this.els = [];
  };
  
  this.getLastEl = function(){
    if( this.els.length == 0 ) return null;
    
    return this.els[ this.els.length - 1 ];
  }
  
  this.getLastRow = function(){
    let rows;
    
    rows = this.table.find( ".index" );
    
    if( rows.length == 0 ) return null;
    
    return rows.last().parent();
  }
  
  this.init( table, settings );
}