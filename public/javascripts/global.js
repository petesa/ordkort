var url = String(window.location);
$(function(){
  $('#btnLaggOrd').on({'click':lagg})
  $('#btnMerOrd').on({'click':mer})
  //if($('h1#ord').length>0)
  if(url.indexOf('users') != -1)
    visa();
})

function mer(event){
  event.preventDefault();
  $('.ord:last').clone().insertAfter('.ord:last');
}

function lagg(event){
  event.preventDefault();
  var data = Array();
  $('.ord').each(function(){
    var word = $(this).find('[name=word]').val();
    var description = $(this).find('[name=description]').val();
    if(word !=='')
      data.push({'word':word, 'description':description});
  })
  //ord = [{ord:'baaahh'},{ord:'boooo'},{ord:'naaaah'}];
  if(data.length > 0){
    $.ajax({
        type: 'POST',
        data:{data:JSON.stringify(data)},//ord,
        url: 'lagg-ord',
        dataType:'JSON'
      }).done(function( response ) {
        // Check for successful (blank) response
        console.log(response.msg);
        if (response.msg === '') {

            // Clear the form inputs
            $('.ord').each().val('');
            message('New word saved!', true);
            // Update the table
            //populateTable();

        }
        else {
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
            console.log(response.msg);
        }
    });
  }else {
    alert('Snälla skriv ett ord att lägga till');
  }
}

function visa(){
  var index = 0;
  var ord = $('h1#ord');
  $.ajax({
    url:'/ordlista',
    type:'GET',
    success:function(data){
      if(data.length>0){
        if(url.indexOf('nytt-ord') != -1){

          if(data.length>10){
            $('<button id="last">last</button>').insertAfter('table#ord').stop().on('click', function(){
              index--;
              index = index < 0 ? Math.ceil(data.length/10)-1 : index;
              pag(index, data.length);
              console.log(index);
            })
            $('<button id="next">next</button>').insertAfter('#last').stop().on('click', function(){
              index++;
              index = index == Math.ceil(data.length/10) ? 0 : index;
              pag(index, data.length);
              console.log(index);
            })
          }

          var row;

          $.each(data, function(i){
              row +='<tr><td>'+$(this).get(0).word+'</td><td>'+$(this).get(0).description+'</td><td><button id="r-'+$(this).get(0)._id+'" class="redigera">Redigera</button></td><td><button id="e-'+$(this).get(0)._id+'" class="radera">Radera</button></td></tr>';
          })

          $('table#ord tbody').append(row);
          $('.radera').on({click:radera});
          $('.redigera').on({click:redigera});
          pag(0, data.length);
        }else{
          var data = shuffle(data);
          ord.text(data[index]['word']);
          if(data.length>1){
            $('<button id="last">last</button>').appendTo('body').stop().on('click', function(){
              index--;
              index = index < 0 ? data.length-1 : index;
              ord.text(data[index]['word']);
              console.log(index);
            })
            $('<button id="next">next</button>').appendTo('body').stop().on('click', function(){
              index++;
              index = index == data.length ? 0 : index;
              ord.text(data[index]['word']);
              console.log(index);
            })
          }
        }
      }
    }
  })
}

function pag(index, max){
  var next = $('#next');
  var last = $('#last');
  $('table#ord tr').hide().each(function(i){
    if(i/10 >= index && i/10 < index+1)
      $(this).show();
  })

  if(index >= Math.round(max/10)-1 )
    next.css({visibility:'hidden'});
  else
    next.css({visibility:'visible'});

  if(index == 0)
    last.css({visibility:'hidden'});
  else
    last.css({visibility:'visible'});
}

function radera(){
  event.preventDefault();
  var ord = $(this);
  var id = ord.attr("id").substr(2);
  $.ajax({
    url:'radera',
    type:'DELETE',
    data:{id:id},
    success:function(response){
      message("ordet raderas", true);
      ord.parents('tr').remove();
    }
  })
}

function redigera(){
  event.preventDefault();
  var row = $(this).parents('tr');
  var ord = row.find('td').first().text();
  var id = $(this).attr("id").substr(2);
  var beskrivning = row.find('td:nth-child(2)').text();
  var form = '<form><input type="text" name="ord" value="'+ord+'"><input type="text" name="beskrivning" value="'+beskrivning+'"><input type="hidden" name="id" value="'+id+'"><button class="cancel">Cancel</button><button class="save">Save</button></form>';
  message(form, false);
}

function shuffle(sourceArray) {
    for (var i = 0; i < sourceArray.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (sourceArray.length - i));

        var temp = sourceArray[j];
        sourceArray[j] = sourceArray[i];
        sourceArray[i] = temp;
    }
    return sourceArray;
}

function message(text, autoclose){
  if($('#message').length == 0)
    $('body').append('<div id="message"/>');

  var message = $('#message');
  message.css({opacity:0});
  message.html(text).delay(500).animate({opacity:1},200, function(){
    $(this).find('.cancel').on({click:close});
    $(this).find('.save').on({click:save});
    if(autoclose)
      setTimeout(close,1000);
  });
}

function close(event){
  if(typeof(event)!='undefined')
    event.preventDefault();
  $('#message').animate({opacity:0},200)
}

function save(event){
  event.preventDefault();
  var form = $(this).parents('form')
  var id = form.find('[name="id"]').val();
  var ord = form.find('[name="ord"]').val();
  var beskrivning = form.find('[name="beskrivning"]').val();
  var data = {id:id, ord:ord, beskrivning:beskrivning}
  if(ord !== '' && beskrivning !== ''){
    $.ajax({
        type: 'POST',
        data:{data:JSON.stringify(data)},//ord,
        url: 'redigera',
        dataType:'JSON',
        success:function(response){
          $('#message').append('<p>Ordet redigeras!</p>');
          setTimeout(close, 1000);
        }
    })
  }else {
    $('#message').append('Snälla fyll i alla del!');
  }
}
