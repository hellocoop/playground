<input
    type="text"
    class="border w-full form-input h-6 px-2"
    class:opacity-50={!selected}
    oninput={() =>
        inputHandler(param.NAME, selectedHelloParamsValues[param.NAME])}
    bind:value={selectedHelloParamsValues[param.NAME]}
/>
