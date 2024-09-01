const ui = document.getElementById("ui")
let fn = () => { return 1 + 2; }

ui.innerHTML = `
    <div class="m-3 position-absolute top-0 start-0">
        <div class="p-3 bg-light rounded-3">
            <strong>Menu ${fn()}</strong>
        </div>
    </div>
`;