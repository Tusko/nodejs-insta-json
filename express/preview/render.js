jQuery(document).ready($ => {
  const loc = window.location.search;
  if (!loc) return alert("Error. Please provide username");
  $.getJSON(`/${loc}`, result => {
    if (result.data.length > 0) {
      $.each(result.data, (i, e) => {
        $("#grid").append(`<img src="${e.src}" width="100" />`);
      });
    }
  });
  return false;
});
