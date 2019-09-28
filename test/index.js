jQuery(document).ready($ => {
  $.getJSON("/?username=mova.space", result => {
    if (result.data.length > 0) {
      $.each(result.data, (i, e) => {
        $("#grid").append(`<img src="${e.src}" width="100" />`);
      });
    }
  });
});
