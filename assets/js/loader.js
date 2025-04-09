const LOADER_TEMPLATE = `
    <div id="loader" class="loader-container">
        <div class="loader"></div>
    </div>
`.trim();

const createLoader = () => {
    const template = document.createElement('template');
    template.innerHTML = LOADER_TEMPLATE;
    return template.content.firstElementChild;
};

const initializeLoader = () => {
    const loader = createLoader();
    document.body.prepend(loader);
};

export const removeLoader = () => {
    const loader = document.getElementById('loader');
    loader?.remove();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoader);
} else {
    initializeLoader();
}

export const getLoader = () => document.getElementById('loader');