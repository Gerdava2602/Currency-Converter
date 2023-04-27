API_KEY = "JpBJRiXJu03xjqyEqO83NU1co3eXRS17";
API_BASE = "https://api.apilayer.com/fixer";

const history = JSON.parse(window.localStorage.getItem("transactions")) || [];

function create_UUID() {
  var dt = new Date().getTime();
  var uuid = "Axxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

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
      symbols = data.symbols;
    })
    .catch((err) => console.log(err));
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
  if (amount.value.match(/^[0-9]+$/) === null)
    return alert("Please enter a valid amount");

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
  card.appendChild(document.createElement("p")).innerHTML = `1 ${to.value} = ${
    amount.value / result
  } ${from.value}`;
  const new_item = {
    id: create_UUID(),
    date: new Date().toDateString(),
    amount: amount.value,
    from: from.value,
    to: to.value,
    result,
  };
  history.push(new_item);
  //Adds row to table
  window.localStorage.setItem("transactions", JSON.stringify(history));
  const tablerows = document.querySelector(".table-rows");
  const row = addRow(
    new_item,
    ["row", "flex", "flex-1", "h-1/3", "w-full"],
    true,
    true
  );
  tablerows.appendChild(row);
}

function addClasses(el, classes) {
  classes.map((item) => el.classList.add(item));
}

function addRow(item, classes, actions = false, id = false) {
  const row = document.createElement("div");
  addClasses(row, classes);
  const keys = id ? Object.keys(item).slice(1) : Object.keys(item);
  keys.map((key) => {
    const div = document.createElement("div");
    div.classList.add("tr");
    const span = document.createElement("span");
    span.innerHTML = item[key];
    div.append(span);
    row.appendChild(div);
  });
  // Creates use buttons
  if (actions) {
    const div = document.createElement("div");
    div.classList.add("tr");
    const deleteButton = document.createElement("button");
    addClasses(deleteButton, ["px-4", "py-2", "w-8", "border"]);
    const deleteSpan = document.createElement("span");
    deleteSpan.setAttribute("class", "delete");
    deleteButton.appendChild(deleteSpan);
    deleteButton.addEventListener("click", () => {
      const index = history.findIndex((el) => el.id === item.id);
      history.splice(index, 1);
      window.localStorage.setItem("transactions", JSON.stringify(history));
      document.querySelector(`#${item.id}`).remove();
    });
    const useButton = document.createElement("button");
    addClasses(useButton, ["px-4", "py-2", "w-8", "border"]);
    useButton.addEventListener("click", () => {
      const index = history.findIndex((el) => el.id === item.id);
      const { from, to, amount } = history[index];
      document.querySelector("#from").value = from;
      document.querySelector("#to").value = to;
      document.querySelector("#amount").value = amount;
    });

    const useSpan = document.createElement("span");
    useSpan.setAttribute("class", "use");
    useButton.appendChild(useSpan);
    div.append(deleteButton, useButton);
    row.appendChild(div);
  }
  row.setAttribute("id", item.id);
  return row;
}

function createRows() {
  const tablerows = document.querySelector(".table-rows");
  history.map((item) => {
    //Creates table rows
    const row = addRow(
      item,
      ["row", "flex", "flex-1", "h-1/3", "w-full"],
      true,
      true
    );
    tablerows.appendChild(row);
  });
}

createRows();

async function createRatesTable() {
  const ratesTable = document.querySelector(".rates");
  let rates = {};
  let base = "";
  await fetch(`${API_BASE}/latest`, {
    method: "GET",
    headers: {
      apikey: API_KEY,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      rates = data.rates;
      base = data.base;
    })
    .catch((err) => console.log(err));

  const entries = Object.entries(rates);
  entries.splice(0, 0, [base, 1]);
  entries.slice(0, 5).map((item) => {
    const row = addRow(
      {
        current: item[0],
        rate: item[1],
      },
      ["row", "flex", "flex-1", "h-1/3", "w-full"]
    );
    ratesTable.appendChild(row);
  });
}

createRatesTable();

document.querySelector(".swap").addEventListener("click", () => {
  const from = document.querySelector("#from").value;
  const to = document.querySelector("#to").value;
  document.querySelector("#from").value = to;
  document.querySelector("#to").value = from;
});

document.querySelector(".convert").addEventListener("click", results);

addSymbols();
