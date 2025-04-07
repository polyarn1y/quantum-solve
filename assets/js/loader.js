const loaderHTML = `
    <div id="loader" class="loader-container">
        <div class="loader"></div>
    </div>
`

document.addEventListener('DOMContentLoaded', () => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = loaderHTML.trim();
    const loaderElement = tempDiv.firstChild;
    document.body.prepend(loaderElement);
});