import axios from "axios";
import { Chart } from "chart.js";

// utils
function $(selector: string) {
  return document.querySelector(selector);
}
function getUnixTimestamp(date: string) {
  return new Date(date).getTime();
}

// DOM
const confirmedTotal = $(".confirmed-total");
const deathsTotal = $(".deaths") as HTMLParagraphElement;
const recoveredTotal = $(".recovered") as HTMLParagraphElement;
const lastUpdatedTime = $(".last-updated-time");
const rankList = $(".rank-list") as HTMLElement;
const deathsList = $(".deaths-list") as HTMLElement;
const recoveredList = $(".recovered-list") as HTMLUListElement;
const deathSpinner = createSpinnerElement("deaths-spinner");
const recoveredSpinner = createSpinnerElement("recovered-spinner");

function createSpinnerElement(id: string) {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.setAttribute("id", id);
  wrapperDiv.setAttribute(
    "class",
    "spinner-wrapper flex justify-center align-center"
  );
  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("class", "ripple-spinner");
  spinnerDiv.appendChild(document.createElement("div"));
  spinnerDiv.appendChild(document.createElement("div"));
  wrapperDiv.appendChild(spinnerDiv);
  return wrapperDiv;
}

// state
let isDeathLoading = false;
let isRecoveredLoading = false;

// api
function fetchCovidSummary() {
  const url = "https://ts-covid-api.vercel.app/api/summary";
  return axios.get(url);
}

/**
 *
 * @param {'spain' | 'switzerland'} countryCode 스페인과 스위스만 지원됩니다.
 * @returns
 */
function fetchCountryInfo(countryCode: string) {
  // params: confirmed, recovered, deaths
  const url = `https://ts-covid-api.vercel.app/api/country/${countryCode}`;
  return axios.get(url);
}

// methods
function startApp() {
  setupData();
  initEvents();
}

// events
function initEvents() {
  rankList.addEventListener("click", handleListClick);
}

async function handleListClick(event: Event): Promise<void> {
  let selectedId: string = "";
  if (event.target instanceof HTMLParagraphElement) {
    selectedId = event.target.parentElement?.id || "";
  }
  if (event.target instanceof HTMLLIElement) {
    selectedId = event.target.id;
  }

  if (isDeathLoading) {
    return;
  }
  clearDeathList();
  clearRecoveredList();
  startLoadingAnimation();
  isDeathLoading = true;

  console.log({ selectedId });

  /**
   * NOTE: 코로나 종식으로 오픈 API 지원이 끝나서 death, recover 데이터는 지원되지 않습니다.
   *       그리고 국가별 상세 정보는 "스페인"과 "스위스"만 지원됩니다.
   */
  // const { data: deathResponse } = await fetchCountryInfo(selectedId, 'deaths');
  // const { data: recoveredResponse } = await fetchCountryInfo(
  //   selectedId,
  //   'recovered',
  // );
  const { data: confirmedResponse } = await fetchCountryInfo(selectedId);
  endLoadingAnimation();
  // NOTE: 코로나 종식으로 오픈 API 지원이 끝나서 death, recover 데이터는 지원되지 않습니다.
  // setDeathsList(deathResponse);
  // setTotalDeathsByCountry(deathResponse);
  // setRecoveredList(recoveredResponse);
  // setTotalRecoveredByCountry(recoveredResponse);
  setChartData(confirmedResponse);
  isDeathLoading = false;
}

interface Death<TCases = undefined, TDate = undefined> {
  Cases: TCases;
  Date: TDate;
}

function setDeathsList(data: Array<Death<string, string>>) {
  const sorted = data.sort(
    (a, b) => getUnixTimestamp(b.Date) - getUnixTimestamp(a.Date)
  );
  sorted.forEach((value) => {
    const li = document.createElement("li");
    li.setAttribute("class", "list-item-b flex align-center");
    const span = document.createElement("span");
    span.textContent = value.Cases;
    span.setAttribute("class", "deaths");
    const p = document.createElement("p");
    p.textContent = new Date(value.Date).toLocaleDateString().slice(0, -1);
    li.appendChild(span);
    li.appendChild(p);
    deathsList.appendChild(li);
  });
}

function clearDeathList() {
  deathsList.innerHTML = "";
}

function setTotalDeathsByCountry(data: Array<Death<string>>) {
  deathsTotal.innerText = data[0].Cases;
}

function setRecoveredList(data: Array<Death<string, string>>) {
  const sorted = data.sort(
    (a, b) => getUnixTimestamp(b.Date) - getUnixTimestamp(a.Date)
  );
  sorted.forEach((value) => {
    const li = document.createElement("li");
    li.setAttribute("class", "list-item-b flex align-center");
    const span = document.createElement("span") as HTMLSpanElement;
    span.textContent = value.Cases;
    span.setAttribute("class", "recovered");
    const p = document.createElement("p");
    p.textContent = new Date(value.Date).toLocaleDateString().slice(0, -1);
    li.appendChild(span);
    li.appendChild(p);
    recoveredList.appendChild(li);
  });
}

function clearRecoveredList() {
  recoveredList.innerHTML = "";
}

function setTotalRecoveredByCountry(data: Array<Death<string>>) {
  recoveredTotal.innerText = data[0].Cases;
}

function startLoadingAnimation() {
  deathsList.appendChild(deathSpinner);
  recoveredList.appendChild(recoveredSpinner);
}

function endLoadingAnimation() {
  deathsList.removeChild(deathSpinner);
  recoveredList.removeChild(recoveredSpinner);
}

async function setupData(): Promise<void> {
  const { data } = await fetchCovidSummary();
  setTotalConfirmedNumber(data);
  setTotalDeathsByWorld(data);
  setTotalRecoveredByWorld(data);
  setCountryRanksByConfirmedCases(data);
  setLastUpdatedTimestamp(data);
}

interface dataType {}

function renderChart(data: dataType, labels: string[]) {
  var ctx = $("#lineChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Confirmed for the last two weeks",
          backgroundColor: "#feb72b",
          borderColor: "#feb72b",
          data,
        },
      ],
    },
    options: {},
  });
}

function setChartData(data: Array<Death<string, string>>) {
  const chartData = data.slice(-14).map((value) => value.Cases);
  const chartLabel = data
    .slice(-14)
    .map((value) => new Date(value.Date).toLocaleDateString().slice(5, -1));
  renderChart(chartData, chartLabel);
}

function setTotalConfirmedNumber(data) {
  confirmedTotal.innerText = data.Countries.reduce(
    (total, current) => (total += current.TotalConfirmed),
    0
  );
}

function setTotalDeathsByWorld(data) {
  deathsTotal.innerText = data.Countries.reduce(
    (total, current) => (total += current.TotalDeaths),
    0
  );
}

function setTotalRecoveredByWorld(data) {
  recoveredTotal.innerText = data.Countries.reduce(
    (total, current) => (total += current.TotalRecovered),
    0
  );
}

function setCountryRanksByConfirmedCases(data) {
  const sorted = data.Countries.sort(
    (a, b) => b.TotalConfirmed - a.TotalConfirmed
  );
  sorted.forEach((value) => {
    const li = document.createElement("li");
    li.setAttribute("class", "list-item flex align-center");
    li.setAttribute("id", value.Slug);
    const span = document.createElement("span");
    span.textContent = value.TotalConfirmed;
    span.setAttribute("class", "cases");
    const p = document.createElement("p");
    p.setAttribute("class", "country");
    p.textContent = value.Country;
    li.appendChild(span);
    li.appendChild(p);
    rankList.appendChild(li);
  });
}

function setLastUpdatedTimestamp(data) {
  lastUpdatedTime.innerText = new Date(data.Date).toLocaleString();
}

startApp();
