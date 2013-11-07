var dir = "/";
var files = [];
var directories = [];
var sort_by = "filename";
var sort_inverse = false;

function delete_button(filepath)
{
  return $('<button type="button" class="btn btn-xs btn-default">delete</button>').click(function(){
    var fd = new FormData();
    fd.append("filepath", filepath);
    $.ajax({
      url: "del.php",
      type: "POST",
      data: fd,
      processData: false,
      contentType: false,
      success: function(data, dataType){
        console.log(data);
        fetch();
      },
    });
  });
}

function unixtime2str(unixtime)
{
  var time = moment.unix(unixtime);
  var str = time.format("YYYY/MM/DD HH:mm:ss");
  
  if(moment().startOf('day') < time){
    str += ' Today';
  }else if(moment().startOf('day').subtract('day') < time){
    str += ' Yesterday';
  }
  
  return str;
}

function filesize2str(filesize)
{
  var str = filesize;

  if(filesize >= 1024*1024*1024){
    str += ' '+(filesize/1024/1024/1024).toFixed(2)+'GB';
  }else if(filesize >= 1024*1024){
    str += ' '+(filesize/1024/1024).toFixed(2)+'MB';
  }else if(filesize >= 1024){
    str += ' '+(filesize/1024).toFixed(2)+'kB';
  }
  
  return str;
}

function rewrite_table(){
  $("#panel_heading").text(dir);
  $("#table tbody tr").remove();
  
  if(!sort_inverse){
    files.sort(
      function(a,b){
        if(a[sort_by] < b[sort_by]) return -1;
        if(a[sort_by] > b[sort_by]) return 1;
        return 0;
      }
    );
  }else{
    files.sort(
      function(a,b){
        if(a[sort_by] < b[sort_by]) return 1;
        if(a[sort_by] > b[sort_by]) return -1;
        return 0;
      }
    );
  }

  $.each(directories, function(index, file){
    if(file.filename == '.'){
      return true;
    }
    if(file.filename == '..' && dir === '/'){
      return true;
    }

    var hash;
    if(file.filename == '..'){
      if(dir.split('/').slice(-1) !== ''){
        parent_dir = dir.split('/').slice(0, -2).join('/');
      }else{
        parent_dir = dir.split('/').slice(0, -3).join('/');
      }
      hash = "#"+parent_dir+'/';
    }else{
      hash = location.hash + file.filename+'/';
    }

    var tr = $("<tr>");
    tr.append($("<td>").append('<span class="glyphicon glyphicon-folder-close"></span>'));
    var a = $('<a>').attr('href', hash).text(file.filename);
    tr.append($("<td>").append(a));
    tr.append($("<td>").text("-"));
    tr.append($("<td>").text(unixtime2str(file.last_modified)));
    if(file.filename != '..'){
      tr.append($("<td>").append(delete_button(dir+file.filename)));
    }else{
      tr.append($("<td>").text("-"));
    }
    $("#table").append(tr);
  });

  // New directory
  var tr = $("<tr>");
  tr.append($("<td>").append('<span class="glyphicon glyphicon-folder-close"></span>'));
  tr.append($("<td>").append($('<div class="input-group">'
    +'  <input id="dirname" type="text" class="form-control" placeholder="directory name">'
    +'  <span class="input-group-btn">'
    +'    <button id="mkdir" class="btn btn-default" type="button">make directory</button>'
    +'  </span>'
    +'</div>')));
  tr.append($("<td>").text("-"));
  tr.append($("<td>").text("-"));
  tr.append($("<td>").text("-"));
  $("#table").append(tr);

  $('#mkdir').click(function(){
    var fd = new FormData();
    fd.append("filepath", dir+$("#dirname").val());
    $.ajax({
      url: "mkdir.php",
      type: "POST",
      data: fd,
      processData: false,
      contentType: false,
      success: function(data, dataType){
        console.log(data);
        fetch();
      },
    });
  });
  
  $.each(files, function(index, file){
    var tr = $("<tr>");
    tr.append($("<td>").append('<span class="glyphicon glyphicon-file"></span>'));
    var a = $('<a>').attr('href', 'files'+dir+file.filename).text(file.filename).attr('download', file.filename);
    tr.append($("<td>").append(a));
    tr.append($("<td>").text(filesize2str(file.filesize)));
    tr.append($("<td>").text(unixtime2str(file.last_modified)));
    tr.append($("<td>").append(delete_button(dir+file.filename)));
    $("#table").append(tr);
  });
}

function fetch()
{
  $.getJSON(
    'ls.php?callback=?',
    {
      dir:dir,
    },
    function(response){
      files = _.filter(response.files, function(file){
        return file.type === "file";
      });
      directories = _.filter(response.files, function(file){
        return file.type === "directory";
      });
      rewrite_table();
    }
  )
}

$(function(){
$("#filename").click(function(){
  if(sort_by == "filename"){
    sort_inverse = !sort_inverse;
  }
  sort_by = "filename";
  rewrite_table();
});
$("#filesize").click(function(){
  if(sort_by == "filesize"){
    sort_inverse = !sort_inverse;
  }
  sort_by = "filesize";
  rewrite_table();
});
$("#last_modified").click(function(){
  if(sort_by == "last_modified"){
    sort_inverse = !sort_inverse;
  }
  sort_by = "last_modified";
  rewrite_table();
});

$("body").bind("dragover", function(){
    return false;
  }).bind("dragend", function(){
    return false;
  }).bind("drop", function(e){
    var files = e.originalEvent.dataTransfer.files;
    var fd = new FormData();
    fd.append("dir", dir);
    $.each(files, function(i, file){
      fd.append("file"+i, file);
    });
    $.ajax({
      url: "upload.php",
      type: "POST",
      data: fd,
      processData: false,
      contentType: false,
      success: function(data, dataType){
        fetch();
      },
    });
    return false;
});

$(window).hashchange(function() {
  if(location.hash == '' || location.hash == '#'){
    location.hash = '#/';
  }
  dir = location.hash.slice(1);
  fetch();
}).hashchange();
});
