var url = String(window.location);
var wpp = 10; //Words per page
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
  if($('.ord').length == 2){
    $('<button class="farre">-</button>').insertBefore('#btnMerOrd');
    $('.farre').on({click:function(event){
        event.preventDefault();
        $('.ord:last').animate({opacity:0},200, function(){
          $(this).slideUp(200,function(){
            $(this).remove();
            if($('.ord').length == 1){
              $('.farre').remove()
            }
          });
        });
      }
    })
  }

}

function lagg(event){
  event.preventDefault();
  var data = Array();
  $('.ord').each(function(){
    var word = $(this).find('[name=word]').val().toLowerCase();
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
        if (typeof response.msg == 'object') {
            // Clear the form inputs
            var alfabet = 'abcdefghijklmnopqrstuvwxyzåäö';
            var marker, newLine;
            var data = response.msg;
            $(data).each(function(){
              var nyOrd = this.word;
              var nyBes = this.description;
              var id = this._id;
              var ordlista = $('table#ord tbody tr td:nth-child(1)')
              ordlista.each(function(i){
                var ord = $(this).text().toLowerCase();
                var step = 0;
                if(alfabet.indexOf(nyOrd[step]) === alfabet.indexOf(ord[step]))
                  step ++;
                if(alfabet.indexOf(nyOrd[step]) < alfabet.indexOf(ord[step])){
                  if(typeof marker == 'undefined')
                    marker = $(this);
                }
                if(typeof marker == 'undefined' && i == ordlista.length-1)
                  marker = $(this);
              })
              var lineContents = '<tr><td>'+nyOrd+'</td><td>'+nyBes+'</td><td><button id="r-'+id+'" class="redigera">Redigera</button></td><td><button id="e-'+id+'" class="radera">Radera</button></td></tr>';
              if(ordlista.length > 1){
                var line = marker.parent('tr');
                line.before(lineContents);
                newLine = line.prev();
              }else{
                $('table#ord').append(lineContents);
                newLine = marker = $('table#ord tbody tr');
              }
              newLine.find('.radera').on({click:radera});
              newLine.find('.redigera').on({click:redigera});
            })

            if(marker.is(':visible')){
                var cell = newLine.find('td');
                var pad = parseInt( cell.css('padding') );
                var height = cell.height();
                var last = newLine.siblings(':visible:last');
                cell.css({padding:0}).wrapInner('<div class="sDown"></div>');
                var visible = newLine.siblings(':visible').length;
                if(visible >= wpp){
                  last.find('td').css({padding:0}).wrapInner('<div class="sUp"></div>');
                  $('.sUp').animate({opacity:0}, function(){
                    $(this).animate({height:0}, function(){
                      last.css({display:'none'}).find('td').css({padding:pad})
                      $(this).replaceWith(this.childNodes);
                    })
                  })
                }
                $('.sDown').css({height:0, padding:pad, opacity:0}).animate({height:height}, function(){
                  $(this).animate({opacity:1}, function(){
                    $(this).replaceWith(this.childNodes);
                    cell.css({padding:pad});
                  })
                });
            }


            $('.ord').find('input[type=text]').val('');
            message('Ord lagt in', true);

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
        $('#forsta').remove();
        if(url.indexOf('admin') != -1){
          if(data.length>10){
            $('<button id="last">last</button>').insertAfter('table#ord').stop().on('click', function(){
              index--;
              index = index < 0 ? Math.ceil(data.length/wpp)-1 : index;
              pag(index, data.length);
              console.log(index);
            })
            $('<button id="next">next</button>').insertAfter('#last').stop().on('click', function(){
              index++;
              index = index == Math.ceil(data.length/wpp) ? 0 : index;
              pag(index, data.length);
              console.log(index);
            })
          }

          var row;

          $.each(data, function(i){
              var ord = capitalize($(this).get(0).word);
              row +='<tr><td>'+ord+'</td><td>'+$(this).get(0).description+'</td><td><button id="r-'+$(this).get(0)._id+'" class="redigera">Redigera</button></td><td><button id="e-'+$(this).get(0)._id+'" class="radera">Radera</button></td></tr>';
          })

          $('table#ord tbody').append(row);
          $('.radera').on({click:radera});
          $('.redigera').on({click:redigera});
          pag(0, data.length);
        }else{
          var data = shuffle(data);
          ord.text(capitalize(data[index]['word']));
          if(data.length>1){
            $('<button id="last">last</button>').appendTo('body').stop().on('click', function(){
              index--;
              index = index < 0 ? data.length-1 : index;
              ord.text(capitalize(data[index]['word']));
              console.log(index);
            })
            $('<button id="next">next</button>').appendTo('body').stop().on('click', function(){
              index++;
              index = index == data.length ? 0 : index;
              ord.text(capitalize(data[index]['word']));
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
  $('table#ord tbody tr').hide().each(function(i){
    if(i/wpp >= index && i/wpp < index+1)
      $(this).show();
  })
  if(index >= Math.floor(max/wpp) )
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
  var form = '<form><h4>Är du säker att du vill radera detta ord?</h4><button class="cancel">Avbryt</button><button class="delete">Radera</button></form>';
  message(form, false, $(this));
}

function redigera(){
  event.preventDefault();
  var row = $(this).parents('tr');
  var ord = row.find('td').first().text();
  var id = $(this).attr("id").substr(2);
  var beskrivning = row.find('td:nth-child(2)').text();
  var form = '<form><input type="text" name="ord" value="'+ord+'"><input type="text" name="beskrivning" value="'+beskrivning+'"><input type="hidden" name="id" value="'+id+'"><button class="cancel">Cancel</button><button class="save">Save</button></form>';
  message(form, false, row);
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

function message(text, autoclose, target){
  if($('#message').length == 0)
    $('body').append('<div id="message"/>');

  var message = $('#message');
  message.css({opacity:0});
  message.html(text).delay(500).animate({opacity:1},200, function(){
    $(this).find('.cancel').on({click:close});
    $(this).find('.save').on({click:function(event){
        update(event,target);
      }
    });
    $(this).find('.delete').on({click:function(event){
        del(event, target);
    }})
    if(autoclose)
      setTimeout(close,1000);
  });
}

function close(event){
  if(typeof(event)!='undefined')
    event.preventDefault();
  $('#message').animate({opacity:0},200)
}

function update(event, row){
  event.preventDefault();
  var form = $(event.target).parents('form')
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
          row.delay(1000).animate({opacity:0}, function(){
            row.find('td:nth-child(1)').text(ord);
            row.find('td:nth-child(2)').text(beskrivning);
            row.animate({opacity:1})
          })
          setTimeout(close, 1000);
        }
    })
  }else {
    $('#message').append('Snälla fyll i alla del!');
  }
}

function del(event, ord){
  event.preventDefault();
  var id = ord.attr("id").substr(2);
  $.ajax({
    url:'radera',
    type:'DELETE',
    data:{id:id},
    success:function(response){
      $('#message').text("Ordet raderas");
      setTimeout(close, 1000);
      ord.parents('tr').animate({opacity:0}, function(){
        var height = $(this).outerHeight();
        var deleted = $(this);
        deleted.find('td').wrapInner('<div class="sUp"></div>');
        var pad = deleted.find('td').css('padding');
        deleted.find('td').css({padding:0})
        $('.sUp').css({padding:pad}).slideUp();

        var nextRow = deleted.siblings('tr:visible:last').next();
        nextRow.css({display:'table-row',opacity:0}).find('td').wrapInner('<div class="sDown"></div>');

        $('.sDown').css({display:'none'}).slideDown(function(){
          deleted.remove();
          $(this).replaceWith(this.childNodes);
          nextRow.animate({opacity:1});
        });
      });
    }
  })
}

function capitalize(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}
