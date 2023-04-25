API_KEY = "U67bLFOLTH2xYV8CjhnWfMbih9vFj8jq";
API_BASE = "https://api.apilayer.com/fixer";

const history = JSON.parse(window.localStorage.getItem("transactions")) || [];

async function addSymbols() {
  let symbols = {};
  await fetch(`${API_BASE}/symbols`, {
    method: "GET",
    headers: {
      apikey: API_KEY,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      symbols = data.symbols;
    })
    .catch((err) => console.log(err));
  console.log(symbols);
  const options = Object.keys(symbols).map((symbol) => {
    return `<option value="${symbol}">${`${symbol}-${symbols[symbol]}`}</option>`;
  });
  document.querySelectorAll(".current").forEach((el) => {
    el.innerHTML = options;
  });
}

async function results() {
  const card = document.querySelector(".results");
  const amount = document.querySelector("#amount");
  const from = document.querySelector("#from");
  const to = document.querySelector("#to");
  console.log(amount, from, to);

  if (amount.value === "" || from.value === "" || to.value === "") {
    document.querySelector(
      "#notifications"
    ).innerHTML = `<div id="toast-success" class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Check icon</span>
    </div>
    <div class="ml-3 text-sm font-normal">Item moved successfully.</div>
    <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
        <span class="sr-only">Close</span>
        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>
</div>`;
  } else {
    let result = 0;
    await fetch(
      `${API_BASE}/convert?to=${to.value}&from=${from.value}&amount=${amount.value}`,
      {
        method: "GET",
        headers: {
          apikey: API_KEY,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        result = +data.result;
      })
      .catch((err) => console.log(err));

    card.setAttribute("style", "display: block;");
    card.innerHTML = "";
    card.appendChild(
      document.createElement("p")
    ).innerHTML = `${amount.value} ${from.value} =`;
    card.appendChild(
      document.createElement("p")
    ).innerHTML = `${result} ${to.value}`;
    card.appendChild(document.createElement("p")).innerHTML = `1 ${
      from.value
    } = ${result / amount.value} ${to.value}`;
    card.appendChild(document.createElement("p")).innerHTML = `1 ${
      to.value
    } = ${amount.value / result} ${from.value}`;
    console.log('done');
    history.push({
      from: from.value,
      to: to.value,
      amount: amount.value,
      result,
    });
    window.localStorage.setItem(
      "transactions",
      JSON.stringify(history)
    );
  }
}

function historyTable() {
  const tablediv = document.querySelector(".history");

}

document.querySelector(".swap").addEventListener("click", () => {
  const from = document.querySelector("#from").value;
  const to = document.querySelector("#to").value;
  document.querySelector("#from").value = to;
  document.querySelector("#to").value = from;
});

document.querySelector(".convert").addEventListener("click", results);

addSymbols();
