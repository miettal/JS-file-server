var dir = "/";
var files = [];
var sort_by = "filename"
location.hash = '#/';

function rewrite_table(){
  
  $("#panel_heading").text(dir);

  $("#table tr:not(#head)").remove();
  
  files.sort(
    function(a,b){
      if(a[sort_by] < b[sort_by]) return -1;
      if(a[sort_by] > b[sort_by]) return 1;
      return 0;
    }
  );

  $.each(files, function(index, file){
    if(file.filename == '.'){
      return true;
    }

    if(file.filename == '..' && dir === '/'){
      return true;
    }

    var tr = $("<tr>").css("cursor","pointer");
    if(file.filename == '..'){
      tr.click(function(){
        if(dir.split('/').slice(-1) !== ''){
          parent_dir = dir.split('/').slice(0, -2).join('/');
        }else{
          parent_dir = dir.split('/').slice(0, -3).join('/');
        }
        location.hash = "#"+parent_dir+'/';
      });
      tr.append($("<td>").append('<span class="glyphicon glyphicon-arrow-up"></span>'));
      tr.append($("<td>").text("parent directory"));
      tr.append($("<td>").text("-"));
      tr.append($("<td>").text(moment.unix(file.last_modified)));
      $("#table").append(tr);
      return true;
    }

    tr.click(function(){
      if(file.type === "directory"){
        location.hash += file.filename+'/';
      }
    });

    if(file.type === "file"){
      tr.append($("<td>").append('<span class="glyphicon glyphicon-file"></span>'));
    }else{
      tr.append($("<td>").append('<span class="glyphicon glyphicon-folder-close"></span>'));
    }
    tr.append($("<td>").text(file.filename));
    if(file.type === "file"){
      tr.append($("<td>").text(file.filesize));
    }else{
      tr.append($("<td>").text("-"));
    }
    tr.append($("<td>").text(moment.unix(file.last_modified)));
    $("#table").append(tr);
  });
}

$(function(){
$("#filename").click(function(){
  sort_by = "filename";
  rewrite_table();
});
$("#filesize").click(function(){
  sort_by = "filesize";
  rewrite_table();
});
$("#last_modified").click(function(){
  sort_by = "last_modified";
  rewrite_table();
});

$(window).hashchange(function() {
  dir = location.hash.slice(1);
  $.getJSON(
    'ls.php?callback=?',
    {
      dir:dir,
    },
    function(response){
      files = response.files;
      rewrite_table();
    }
  )
}).hashchange();
});
