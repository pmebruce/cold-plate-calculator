"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Droplets,
  Flame,
  Gauge,
  Info,
  Ruler,
  Sigma,
  Thermometer,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type FluidKey = "water" | "eg50" | "pg25";

type Inputs = {
  outputPower: string;
  efficiency: string;
  inletTemp: string;
  flowRate: string;
  channelLength: string;
  channelWidth: string;
  channelHeight: string;
};

type FluidPoint = {
  t: number;
  rho: number;
  cp: number;
  k: number;
  mu: number;
};

type FluidDefinition = {
  name: string;
  shortName: string;
  formula: string;
  range: [number, number];
  boilingPoint: number;
  points: FluidPoint[];
};

type ValidCalculation = {
  valid: true;
  plateAverage: number;
  outletTemp: number;
  heatLoss: number;
  fluidRise: number;
  reynolds: number;
  prandtl: number;
  nusselt: number;
  heatTransferCoefficient: number;
  hydraulicDiameter: number;
  velocity: number;
  meanFluidTemp: number;
  density: number;
  specificHeat: number;
  thermalConductivity: number;
  dynamicViscosity: number;
  volumeFlow: number;
  massFlow: number;
  length: number;
  width: number;
  height: number;
  flowArea: number;
  wettedPerimeter: number;
  wettedArea: number;
  aspectRatio: number;
  laminarNusselt: number;
  turbulentNusselt: number | null;
  frictionFactor: number | null;
  transitionBlend: number | null;
  convectionRise: number;
  iterations: number;
  regime: "層流" | "過渡流" | "紊流";
  warnings: string[];
};

type InvalidCalculation = {
  valid: false;
  errors: string[];
};

type Calculation = ValidCalculation | InvalidCalculation;

const WATER_POINTS: FluidPoint[] = [
  { t: 0, rho: 999.84, cp: 4218, k: 0.561, mu: 1.792 },
  { t: 10, rho: 999.7, cp: 4192, k: 0.58, mu: 1.307 },
  { t: 20, rho: 998.21, cp: 4182, k: 0.598, mu: 1.002 },
  { t: 30, rho: 995.65, cp: 4178, k: 0.615, mu: 0.797 },
  { t: 40, rho: 992.22, cp: 4179, k: 0.63, mu: 0.653 },
  { t: 50, rho: 988.04, cp: 4181, k: 0.643, mu: 0.547 },
  { t: 60, rho: 983.2, cp: 4185, k: 0.654, mu: 0.467 },
  { t: 70, rho: 977.76, cp: 4190, k: 0.663, mu: 0.404 },
  { t: 80, rho: 971.8, cp: 4197, k: 0.67, mu: 0.355 },
  { t: 90, rho: 965.3, cp: 4205, k: 0.675, mu: 0.315 },
  { t: 100, rho: 958.35, cp: 4216, k: 0.679, mu: 0.282 },
];

const EG50_POINTS: FluidPoint[] = [
  { t: -30, rho: 1090.31, cp: 3090, k: 0.3333, mu: 43.997 },
  { t: -20, rho: 1088.15, cp: 3129, k: 0.3442, mu: 22.0816 },
  { t: 10, rho: 1078.72, cp: 3245, k: 0.3724, mu: 5.5071 },
  { t: 40, rho: 1064.91, cp: 3361, k: 0.3937, mu: 2.2567 },
  { t: 65, rho: 1050.05, cp: 3457, k: 0.4062, mu: 1.2936 },
  { t: 90, rho: 1032.15, cp: 3554, k: 0.4139, mu: 0.8227 },
  { t: 120, rho: 1006.66, cp: 3670, k: 0.4168, mu: 0.5252 },
];

const PG25_POINTS: FluidPoint[] = [
  { t: -5, rho: 1037.3, cp: 3990, k: 0.425, mu: 7.88 },
  { t: 0, rho: 1036.8, cp: 4010, k: 0.432, mu: 6.2 },
  { t: 5, rho: 1035.7, cp: 4030, k: 0.438, mu: 4.94 },
  { t: 10, rho: 1034.3, cp: 4040, k: 0.444, mu: 3.99 },
  { t: 15, rho: 1032.4, cp: 4060, k: 0.45, mu: 3.27 },
  { t: 20, rho: 1030.3, cp: 4070, k: 0.456, mu: 2.72 },
  { t: 25, rho: 1028, cp: 4080, k: 0.462, mu: 2.29 },
  { t: 30, rho: 1025.6, cp: 4090, k: 0.467, mu: 1.95 },
  { t: 35, rho: 1023, cp: 4110, k: 0.472, mu: 1.68 },
  { t: 40, rho: 1020.3, cp: 4120, k: 0.476, mu: 1.47 },
  { t: 45, rho: 1017.6, cp: 4120, k: 0.481, mu: 1.29 },
  { t: 50, rho: 1014.8, cp: 4130, k: 0.485, mu: 1.15 },
  { t: 55, rho: 1012, cp: 4140, k: 0.488, mu: 1.03 },
  { t: 60, rho: 1009, cp: 4150, k: 0.492, mu: 0.94 },
  { t: 65, rho: 1006, cp: 4160, k: 0.495, mu: 0.85 },
  { t: 70, rho: 1002.7, cp: 4170, k: 0.497, mu: 0.77 },
  { t: 75, rho: 999.2, cp: 4170, k: 0.5, mu: 0.7 },
  { t: 80, rho: 995.4, cp: 4180, k: 0.502, mu: 0.63 },
];

const FLUIDS: Record<FluidKey, FluidDefinition> = {
  water: {
    name: "水",
    shortName: "Water",
    formula: "純水",
    range: [0, 100],
    boilingPoint: 100,
    points: WATER_POINTS,
  },
  eg50: {
    name: "EG 50%",
    shortName: "Ethylene glycol",
    formula: "乙二醇 50 vol%",
    range: [-30, 120],
    boilingPoint: 107.2,
    points: EG50_POINTS,
  },
  pg25: {
    name: "PG 25%",
    shortName: "Propylene glycol",
    formula: "丙二醇 25 vol%",
    range: [-5, 80],
    boilingPoint: 101.4,
    points: PG25_POINTS,
  },
};

const DEFAULT_INPUTS: Inputs = {
  outputPower: "3000",
  efficiency: "96",
  inletTemp: "30",
  flowRate: "3",
  channelLength: "300",
  channelWidth: "12",
  channelHeight: "3",
};

function parseDecimal(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") {
    return Number.NaN;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function cleanDecimal(raw: string) {
  const normalized = raw.replace(/,/g, ".");
  let output = "";
  let hasDecimal = false;

  for (const character of normalized) {
    if (character >= "0" && character <= "9") {
      output += character;
    } else if (character === "." && !hasDecimal) {
      output += character;
      hasDecimal = true;
    } else if (character === "-" && output.length === 0) {
      output += character;
    }
  }

  return output;
}

function interpolateProperties(fluid: FluidDefinition, temperature: number) {
  const points = fluid.points;
  const clampedTemperature = Math.min(
    points[points.length - 1].t,
    Math.max(points[0].t, temperature),
  );

  let lower = points[0];
  let upper = points[points.length - 1];

  for (let index = 0; index < points.length - 1; index += 1) {
    if (
      clampedTemperature >= points[index].t &&
      clampedTemperature <= points[index + 1].t
    ) {
      lower = points[index];
      upper = points[index + 1];
      break;
    }
  }

  const span = upper.t - lower.t;
  const fraction = span === 0 ? 0 : (clampedTemperature - lower.t) / span;
  const mix = (start: number, end: number) => start + (end - start) * fraction;

  return {
    rho: mix(lower.rho, upper.rho),
    cp: mix(lower.cp, upper.cp),
    k: mix(lower.k, upper.k),
    mu: mix(lower.mu, upper.mu) / 1000,
    clamped: temperature !== clampedTemperature,
  };
}

function calculate(inputs: Inputs, fluidKey: FluidKey): Calculation {
  const outputPower = parseDecimal(inputs.outputPower);
  const efficiency = parseDecimal(inputs.efficiency);
  const inletTemp = parseDecimal(inputs.inletTemp);
  const flowRate = parseDecimal(inputs.flowRate);
  const channelLength = parseDecimal(inputs.channelLength);
  const channelWidth = parseDecimal(inputs.channelWidth);
  const channelHeight = parseDecimal(inputs.channelHeight);

  const errors: string[] = [];
  if (!Number.isFinite(outputPower) || outputPower < 0) errors.push("輸出功率需為 0 以上");
  if (!Number.isFinite(efficiency) || efficiency <= 0 || efficiency > 100)
    errors.push("效率需大於 0 且不超過 100%");
  if (!Number.isFinite(inletTemp)) errors.push("請輸入入口液溫");
  if (!Number.isFinite(flowRate) || flowRate <= 0) errors.push("流量需大於 0");
  if (!Number.isFinite(channelLength) || channelLength <= 0)
    errors.push("流道長度需大於 0");
  if (!Number.isFinite(channelWidth) || channelWidth <= 0)
    errors.push("流道寬度需大於 0");
  if (!Number.isFinite(channelHeight) || channelHeight <= 0)
    errors.push("流道高度需大於 0");

  if (errors.length > 0) return { valid: false, errors };

  const fluid = FLUIDS[fluidKey];
  const heatLoss = outputPower * (100 / efficiency - 1);
  const volumeFlow = flowRate / 60000;

  let outletTemp = inletTemp;
  let iterations = 0;
  for (let iteration = 0; iteration < 20; iteration += 1) {
    iterations = iteration + 1;
    const meanFluidTemp = (inletTemp + outletTemp) / 2;
    const properties = interpolateProperties(fluid, meanFluidTemp);
    const massFlow = volumeFlow * properties.rho;
    const nextOutlet = inletTemp + heatLoss / (massFlow * properties.cp);
    if (Math.abs(nextOutlet - outletTemp) < 0.0001) {
      outletTemp = nextOutlet;
      break;
    }
    outletTemp = (outletTemp + nextOutlet) / 2;
  }

  const meanFluidTemp = (inletTemp + outletTemp) / 2;
  const properties = interpolateProperties(fluid, meanFluidTemp);
  const length = channelLength / 1000;
  const width = channelWidth / 1000;
  const height = channelHeight / 1000;
  const flowArea = width * height;
  const wettedPerimeter = 2 * (width + height);
  const wettedArea = wettedPerimeter * length;
  const hydraulicDiameter = (4 * flowArea) / wettedPerimeter;
  const velocity = volumeFlow / flowArea;
  const reynolds =
    (properties.rho * velocity * hydraulicDiameter) / properties.mu;
  const prandtl = (properties.cp * properties.mu) / properties.k;
  const aspectRatio = Math.min(width, height) / Math.max(width, height);
  const laminarNusselt =
    8.235 *
    (1 -
      2.0421 * aspectRatio +
      3.0853 * aspectRatio ** 2 -
      2.4765 * aspectRatio ** 3 +
      1.0578 * aspectRatio ** 4 -
      0.1861 * aspectRatio ** 5);

  const turbulentResult = (re: number) => {
    const boundedRe = Math.max(3000, re);
    const friction = (0.79 * Math.log(boundedRe) - 1.64) ** -2;
    return {
      friction,
      nusselt:
        ((friction / 8) * (boundedRe - 1000) * prandtl) /
        (1 +
          12.7 * Math.sqrt(friction / 8) * (prandtl ** (2 / 3) - 1)),
    };
  };

  let nusselt = laminarNusselt;
  let regime: ValidCalculation["regime"] = "層流";
  let turbulentNusselt: number | null = null;
  let frictionFactor: number | null = null;
  let transitionBlend: number | null = null;

  if (reynolds >= 4000) {
    regime = "紊流";
    const turbulent = turbulentResult(reynolds);
    nusselt = turbulent.nusselt;
    turbulentNusselt = turbulent.nusselt;
    frictionFactor = turbulent.friction;
  } else if (reynolds > 2300) {
    regime = "過渡流";
    const blend = (reynolds - 2300) / 1700;
    const turbulent = turbulentResult(reynolds);
    nusselt =
      laminarNusselt * (1 - blend) + turbulent.nusselt * blend;
    turbulentNusselt = turbulent.nusselt;
    frictionFactor = turbulent.friction;
    transitionBlend = blend;
  }

  const heatTransferCoefficient = (nusselt * properties.k) / hydraulicDiameter;
  const convectionRise =
    heatLoss === 0 ? 0 : heatLoss / (heatTransferCoefficient * wettedArea);
  const plateAverage = meanFluidTemp + convectionRise;
  const warnings: string[] = [];

  if (
    properties.clamped ||
    inletTemp < fluid.range[0] ||
    inletTemp > fluid.range[1] ||
    outletTemp < fluid.range[0] ||
    outletTemp > fluid.range[1]
  ) {
    warnings.push(
      `液體均溫超出 ${fluid.range[0]}～${fluid.range[1]}°C 物性表範圍，已用邊界值估算。`,
    );
  }
  if (outletTemp >= fluid.boilingPoint - 3) {
    warnings.push("出口液溫接近常壓沸點；本模型未納入系統壓力與沸騰。");
  }
  if (length / hydraulicDiameter < 10) {
    warnings.push("L/Dh 小於 10，入口區效應可能使實際對流係數不同。");
  }
  if (regime === "過渡流") {
    warnings.push("目前位於過渡流區，對流係數的不確定性較高。");
  }
  if (reynolds > 5_000_000 || prandtl < 0.5 || prandtl > 2000) {
    warnings.push("流況超出內建關係式的建議適用範圍。");
  }

  return {
    valid: true,
    plateAverage,
    outletTemp,
    heatLoss,
    fluidRise: outletTemp - inletTemp,
    reynolds,
    prandtl,
    nusselt,
    heatTransferCoefficient,
    hydraulicDiameter,
    velocity,
    meanFluidTemp,
    density: properties.rho,
    specificHeat: properties.cp,
    thermalConductivity: properties.k,
    dynamicViscosity: properties.mu,
    volumeFlow,
    massFlow: volumeFlow * properties.rho,
    length,
    width,
    height,
    flowArea,
    wettedPerimeter,
    wettedArea,
    aspectRatio,
    laminarNusselt,
    turbulentNusselt,
    frictionFactor,
    transitionBlend,
    convectionRise,
    iterations,
    regime,
    warnings,
  };
}

function formatNumber(value: number, digits = 1) {
  return value.toLocaleString("zh-TW", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatEngineering(value: number) {
  if (Math.abs(value) >= 100000) return value.toExponential(2);
  if (Math.abs(value) >= 1000) return formatNumber(value, 0);
  if (Math.abs(value) >= 100) return formatNumber(value, 1);
  return formatNumber(value, 2);
}

function formatScientific(value: number, digits = 3) {
  return value
    .toExponential(digits)
    .replace("e-", "e−")
    .replace("e+", "e+");
}

function FormulaBlock({
  formula,
  substitution,
  result,
}: {
  formula: string;
  substitution: string;
  result?: string;
}) {
  return (
    <div className="formula-block">
      <code className="formula-general">{formula}</code>
      <code className="formula-substitution">{substitution}</code>
      {result && <strong className="formula-result">{result}</strong>}
    </div>
  );
}

function CalculationStep({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <article className="calculation-step">
      <div className="step-heading">
        <span>{index}</span>
        <div>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
      </div>
      <div className="step-body">{children}</div>
    </article>
  );
}

function NumberField({
  id,
  label,
  value,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  unit: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="number-field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="input-shell">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(cleanDecimal(event.target.value))}
          aria-label={`${label}，單位 ${unit}`}
        />
        <span className="input-unit">{unit}</span>
      </span>
    </label>
  );
}

function TemperatureValue({ value }: { value: number }) {
  return (
    <strong className="temperature-value">
      {formatNumber(value, 1)}
      <span>°C</span>
    </strong>
  );
}

export default function Home() {
  const [fluid, setFluid] = useState<FluidKey>("water");
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const result = useMemo(() => calculate(inputs, fluid), [inputs, fluid]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sw.js`).catch(() => undefined);
    }
  }, []);

  const updateInput = (key: keyof Inputs, value: string) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const entered = {
    outputPower: parseDecimal(inputs.outputPower),
    efficiencyPercent: parseDecimal(inputs.efficiency),
    efficiencyRatio: parseDecimal(inputs.efficiency) / 100,
    inletTemp: parseDecimal(inputs.inletTemp),
    flowRate: parseDecimal(inputs.flowRate),
    channelLength: parseDecimal(inputs.channelLength),
    channelWidth: parseDecimal(inputs.channelWidth),
    channelHeight: parseDecimal(inputs.channelHeight),
  };

  return (
    <main className="app-shell">
      <div className="ambient-grid" aria-hidden="true" />

      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <Droplets size={24} strokeWidth={2.2} />
          </span>
          <div>
            <p className="eyebrow">THERMAL TOOL · 01</p>
            <h1>冷板均溫計算器</h1>
          </div>
        </div>
        <p className="header-note">單一矩形流道 · 穩態估算</p>
      </header>

      <section className="workspace" aria-label="冷板計算工作區">
        <section className="control-panel panel">
          <div className="section-heading">
            <div>
              <span className="section-index">01</span>
              <h2>冷卻液</h2>
            </div>
            <Droplets size={20} aria-hidden="true" />
          </div>

          <RadioGroup
            value={fluid}
            onValueChange={(value) => setFluid(value as FluidKey)}
            className="fluid-grid"
            aria-label="冷卻液種類"
          >
            {(Object.keys(FLUIDS) as FluidKey[]).map((key) => {
              const item = FLUIDS[key];
              return (
                <label
                  key={key}
                  htmlFor={`fluid-${key}`}
                  className={`fluid-option ${fluid === key ? "is-selected" : ""}`}
                >
                  <RadioGroupItem id={`fluid-${key}`} value={key} />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.formula}</small>
                  </span>
                </label>
              );
            })}
          </RadioGroup>

          <div className="section-divider" />

          <div className="section-heading">
            <div>
              <span className="section-index">02</span>
              <h2>熱負載與流量</h2>
            </div>
            <Flame size={20} aria-hidden="true" />
          </div>

          <div className="field-grid two-columns">
            <NumberField
              id="output-power"
              label="輸出功率"
              value={inputs.outputPower}
              unit="W"
              onChange={(value) => updateInput("outputPower", value)}
            />
            <NumberField
              id="efficiency"
              label="效率"
              value={inputs.efficiency}
              unit="%"
              onChange={(value) => updateInput("efficiency", value)}
            />
            <NumberField
              id="inlet-temperature"
              label="入口液溫"
              value={inputs.inletTemp}
              unit="°C"
              onChange={(value) => updateInput("inletTemp", value)}
            />
            <NumberField
              id="flow-rate"
              label="體積流量"
              value={inputs.flowRate}
              unit="L/min"
              onChange={(value) => updateInput("flowRate", value)}
            />
          </div>

          <div className="loss-strip" aria-live="polite">
            <span>效率損耗熱量</span>
            <strong>
              {result.valid ? `${formatNumber(result.heatLoss, 1)} W` : "—"}
            </strong>
          </div>

          <div className="section-divider" />

          <div className="section-heading">
            <div>
              <span className="section-index">03</span>
              <h2>矩形流道</h2>
            </div>
            <Ruler size={20} aria-hidden="true" />
          </div>

          <div className="channel-visual" aria-hidden="true">
            <div className="channel-line">
              <span className="flow-pulse" />
            </div>
            <div className="channel-caption">
              <span>INLET</span>
              <ArrowRight size={16} />
              <span>OUTLET</span>
            </div>
          </div>

          <div className="field-grid three-columns">
            <NumberField
              id="channel-length"
              label="長度 L"
              value={inputs.channelLength}
              unit="mm"
              onChange={(value) => updateInput("channelLength", value)}
            />
            <NumberField
              id="channel-width"
              label="寬度 W"
              value={inputs.channelWidth}
              unit="mm"
              onChange={(value) => updateInput("channelWidth", value)}
            />
            <NumberField
              id="channel-height"
              label="高度 H"
              value={inputs.channelHeight}
              unit="mm"
              onChange={(value) => updateInput("channelHeight", value)}
            />
          </div>
        </section>

        <aside className="result-panel" aria-live="polite">
          {result.valid ? (
            <>
              <section className="primary-result result-card">
                <div className="result-label">
                  <span className="icon-chip hot">
                    <Thermometer size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>冷板平均溫度</strong>
                    <small>流道壁面均溫估算</small>
                  </span>
                </div>
                <TemperatureValue value={result.plateAverage} />
                <div className="result-glow" aria-hidden="true" />
              </section>

              <section className="secondary-result result-card">
                <div className="result-label">
                  <span className="icon-chip cool">
                    <Droplets size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>出口液溫</strong>
                    <small>{FLUIDS[fluid].formula}</small>
                  </span>
                </div>
                <TemperatureValue value={result.outletTemp} />
              </section>

              <section className="temperature-path" aria-label="溫度路徑">
                <div>
                  <span>入口</span>
                  <strong>{formatNumber(parseDecimal(inputs.inletTemp), 1)}°</strong>
                </div>
                <span className="path-line" aria-hidden="true" />
                <div>
                  <span>出口</span>
                  <strong>{formatNumber(result.outletTemp, 1)}°</strong>
                </div>
                <span className="path-line warm" aria-hidden="true" />
                <div>
                  <span>冷板</span>
                  <strong>{formatNumber(result.plateAverage, 1)}°</strong>
                </div>
              </section>

              <section className="diagnostics panel">
                <div className="diagnostic-item">
                  <span>液體溫升</span>
                  <strong>{formatNumber(result.fluidRise, 2)} K</strong>
                </div>
                <div className="diagnostic-item">
                  <span>流況</span>
                  <strong>{result.regime}</strong>
                </div>
                <div className="diagnostic-item">
                  <span>Reynolds</span>
                  <strong>{formatEngineering(result.reynolds)}</strong>
                </div>
                <div className="diagnostic-item">
                  <span>對流係數 h</span>
                  <strong>
                    {formatNumber(result.heatTransferCoefficient, 0)} W/m²K
                  </strong>
                </div>
              </section>

              {result.warnings.length > 0 && (
                <section className="warning-card">
                  <AlertTriangle size={19} aria-hidden="true" />
                  <div>
                    {result.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section className="invalid-card result-card">
              <span className="icon-chip hot">
                <AlertTriangle size={22} aria-hidden="true" />
              </span>
              <h2>還差一點資料</h2>
              <ul>
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </section>

      <section className="calculation-report panel">
        <div className="report-heading">
          <span className="report-icon" aria-hidden="true">
            <Sigma size={24} />
          </span>
          <div>
            <p className="eyebrow">CALCULATION TRACE</p>
            <h2>公式與本次計算明細</h2>
            <p>依照目前輸入值，逐步列出通式、數值代入與計算結果。</p>
          </div>
        </div>

        {result.valid ? (
          <>
            <div className="report-status">
              <span>{FLUIDS[fluid].formula}</span>
              <span>{result.regime}</span>
              <span>物性取自 {formatNumber(result.meanFluidTemp, 2)}°C</span>
              <span>數值即時更新</span>
            </div>

            <div className="calculation-steps">
              <CalculationStep
                index="01"
                title="由效率求損耗熱量"
                note="假設電源的全部效率損耗都傳入冷卻液。"
              >
                <FormulaBlock
                  formula="η = 效率(%) / 100"
                  substitution={`η = ${formatNumber(entered.efficiencyPercent, 3)} / 100`}
                  result={`η = ${formatNumber(entered.efficiencyRatio, 5)}`}
                />
                <FormulaBlock
                  formula="Qloss = Pout × (1 / η − 1)"
                  substitution={`Qloss = ${formatNumber(entered.outputPower, 3)} × (1 / ${formatNumber(entered.efficiencyRatio, 5)} − 1)`}
                  result={`Qloss = ${formatNumber(result.heatLoss, 3)} W`}
                />
              </CalculationStep>

              <CalculationStep
                index="02"
                title="換算流量並取得液體物性"
                note="出口液溫與物性互相影響，因此步驟 02～03 會反覆計算至收斂。"
              >
                <FormulaBlock
                  formula="V̇ = 流量(L/min) / 60,000"
                  substitution={`V̇ = ${formatNumber(entered.flowRate, 4)} / 60,000`}
                  result={`V̇ = ${formatScientific(result.volumeFlow, 4)} m³/s`}
                />
                <FormulaBlock
                  formula="Tbulk,avg = (Tin + Tout) / 2"
                  substitution={`Tbulk,avg = (${formatNumber(entered.inletTemp, 3)} + ${formatNumber(result.outletTemp, 3)}) / 2`}
                  result={`Tbulk,avg = ${formatNumber(result.meanFluidTemp, 3)} °C`}
                />
                <FormulaBlock
                  formula="X(T) = X₁ + (X₂ − X₁)(T − T₁) / (T₂ − T₁)"
                  substitution={`在物性表中夾住 ${formatNumber(result.meanFluidTemp, 3)}°C 的兩個溫度點間，分別對 ρ、cp、k、μ 做線性內插`}
                />
                <div className="property-readout">
                  <span>在平均液溫線性內插 {FLUIDS[fluid].name} 物性表</span>
                  <code>ρ = {formatNumber(result.density, 3)} kg/m³</code>
                  <code>cp = {formatNumber(result.specificHeat, 2)} J/(kg·K)</code>
                  <code>k = {formatNumber(result.thermalConductivity, 5)} W/(m·K)</code>
                  <code>μ = {formatNumber(result.dynamicViscosity * 1000, 5)} mPa·s</code>
                </div>
                <FormulaBlock
                  formula="ṁ = ρ × V̇"
                  substitution={`ṁ = ${formatNumber(result.density, 3)} × ${formatScientific(result.volumeFlow, 4)}`}
                  result={`ṁ = ${formatNumber(result.massFlow, 6)} kg/s`}
                />
              </CalculationStep>

              <CalculationStep
                index="03"
                title="計算出口液溫"
                note={`先令 Tout = Tin，再更新平均液溫、cp 與 Tout，直到前後差小於 0.0001°C；本次共 ${result.iterations} 次迭代。`}
              >
                <FormulaBlock
                  formula="Tout = Tin + Qloss / (ṁ × cp)"
                  substitution={`Tout = ${formatNumber(entered.inletTemp, 3)} + ${formatNumber(result.heatLoss, 3)} / (${formatNumber(result.massFlow, 6)} × ${formatNumber(result.specificHeat, 2)})`}
                  result={`Tout = ${formatNumber(result.outletTemp, 4)} °C`}
                />
                <FormulaBlock
                  formula="ΔTfluid = Tout − Tin"
                  substitution={`ΔTfluid = ${formatNumber(result.outletTemp, 4)} − ${formatNumber(entered.inletTemp, 3)}`}
                  result={`ΔTfluid = ${formatNumber(result.fluidRise, 4)} K`}
                />
              </CalculationStep>

              <CalculationStep
                index="04"
                title="建立矩形流道幾何"
                note="所有尺寸先由 mm 換成 m，再計算截面、濕周、濕潤面積與水力直徑。"
              >
                <FormulaBlock
                  formula="L, W, H = 輸入尺寸 / 1,000"
                  substitution={`L = ${formatNumber(entered.channelLength, 3)} / 1,000；W = ${formatNumber(entered.channelWidth, 3)} / 1,000；H = ${formatNumber(entered.channelHeight, 3)} / 1,000`}
                  result={`L = ${formatNumber(result.length, 6)} m；W = ${formatNumber(result.width, 6)} m；H = ${formatNumber(result.height, 6)} m`}
                />
                <FormulaBlock
                  formula="Ac = W × H"
                  substitution={`Ac = ${formatNumber(result.width, 6)} × ${formatNumber(result.height, 6)}`}
                  result={`Ac = ${formatScientific(result.flowArea, 4)} m²`}
                />
                <FormulaBlock
                  formula="Pw = 2(W + H)；Awet = Pw × L"
                  substitution={`Pw = 2(${formatNumber(result.width, 6)} + ${formatNumber(result.height, 6)})；Awet = ${formatNumber(result.wettedPerimeter, 6)} × ${formatNumber(result.length, 6)}`}
                  result={`Pw = ${formatNumber(result.wettedPerimeter, 6)} m；Awet = ${formatNumber(result.wettedArea, 7)} m²`}
                />
                <FormulaBlock
                  formula="Dh = 4Ac / Pw = 2WH / (W + H)"
                  substitution={`Dh = 4 × ${formatScientific(result.flowArea, 4)} / ${formatNumber(result.wettedPerimeter, 6)}`}
                  result={`Dh = ${formatNumber(result.hydraulicDiameter, 7)} m (${formatNumber(result.hydraulicDiameter * 1000, 4)} mm)`}
                />
              </CalculationStep>

              <CalculationStep
                index="05"
                title="判定流況並求 Nusselt 數"
                note="Re ≤ 2,300 為層流；2,300～4,000 為過渡流；Re ≥ 4,000 為紊流。"
              >
                <FormulaBlock
                  formula="u = V̇ / Ac"
                  substitution={`u = ${formatScientific(result.volumeFlow, 4)} / ${formatScientific(result.flowArea, 4)}`}
                  result={`u = ${formatNumber(result.velocity, 5)} m/s`}
                />
                <FormulaBlock
                  formula="Re = ρuDh / μ"
                  substitution={`Re = ${formatNumber(result.density, 3)} × ${formatNumber(result.velocity, 5)} × ${formatNumber(result.hydraulicDiameter, 7)} / ${formatScientific(result.dynamicViscosity, 4)}`}
                  result={`Re = ${formatNumber(result.reynolds, 2)} → ${result.regime}`}
                />
                <FormulaBlock
                  formula="Pr = cpμ / k"
                  substitution={`Pr = ${formatNumber(result.specificHeat, 2)} × ${formatScientific(result.dynamicViscosity, 4)} / ${formatNumber(result.thermalConductivity, 5)}`}
                  result={`Pr = ${formatNumber(result.prandtl, 4)}`}
                />
                <FormulaBlock
                  formula="α = min(W,H) / max(W,H)"
                  substitution={`α = ${formatNumber(Math.min(result.width, result.height), 6)} / ${formatNumber(Math.max(result.width, result.height), 6)}`}
                  result={`α = ${formatNumber(result.aspectRatio, 5)}`}
                />

                {result.regime === "層流" && (
                  <FormulaBlock
                    formula="Nu = 8.235(1 − 2.0421α + 3.0853α² − 2.4765α³ + 1.0578α⁴ − 0.1861α⁵)"
                    substitution={`Nu = 8.235 × F(α = ${formatNumber(result.aspectRatio, 5)})`}
                    result={`Nu = ${formatNumber(result.nusselt, 5)}`}
                  />
                )}

                {result.regime === "紊流" &&
                  result.frictionFactor !== null &&
                  result.turbulentNusselt !== null && (
                    <>
                      <FormulaBlock
                        formula="f = (0.79 ln(Re) − 1.64)⁻²"
                        substitution={`f = (0.79 ln(${formatNumber(result.reynolds, 2)}) − 1.64)⁻²`}
                        result={`f = ${formatNumber(result.frictionFactor, 6)}`}
                      />
                      <FormulaBlock
                        formula="Nu = [(f/8)(Re−1000)Pr] / [1 + 12.7(f/8)¹ᐟ²(Pr²ᐟ³−1)]"
                        substitution={`Nu = Gnielinski(f=${formatNumber(result.frictionFactor, 6)}, Re=${formatNumber(result.reynolds, 2)}, Pr=${formatNumber(result.prandtl, 4)})`}
                        result={`Nu = ${formatNumber(result.turbulentNusselt, 5)}`}
                      />
                    </>
                  )}

                {result.regime === "過渡流" &&
                  result.frictionFactor !== null &&
                  result.turbulentNusselt !== null &&
                  result.transitionBlend !== null && (
                    <>
                      <FormulaBlock
                        formula="Nulam = 8.235(1 − 2.0421α + 3.0853α² − 2.4765α³ + 1.0578α⁴ − 0.1861α⁵)"
                        substitution={`Nulam = 8.235 × F(α = ${formatNumber(result.aspectRatio, 5)})`}
                        result={`Nulam = ${formatNumber(result.laminarNusselt, 5)}`}
                      />
                      <FormulaBlock
                        formula="Re* = max(3,000, Re)；f = (0.79 ln(Re*) − 1.64)⁻²"
                        substitution={`Re* = ${formatNumber(Math.max(3000, result.reynolds), 2)}；f = (0.79 ln(${formatNumber(Math.max(3000, result.reynolds), 2)}) − 1.64)⁻²`}
                        result={`f = ${formatNumber(result.frictionFactor, 6)}`}
                      />
                      <FormulaBlock
                        formula="Nuturb = [(f/8)(Re*−1000)Pr] / [1 + 12.7(f/8)¹ᐟ²(Pr²ᐟ³−1)]"
                        substitution={`Nuturb = Gnielinski(f=${formatNumber(result.frictionFactor, 6)}, Re*=${formatNumber(Math.max(3000, result.reynolds), 2)}, Pr=${formatNumber(result.prandtl, 4)})`}
                        result={`Nuturb = ${formatNumber(result.turbulentNusselt, 5)}`}
                      />
                      <FormulaBlock
                        formula="β = (Re − 2,300) / (4,000 − 2,300)"
                        substitution={`β = (${formatNumber(result.reynolds, 2)} − 2,300) / 1,700`}
                        result={`β = ${formatNumber(result.transitionBlend, 6)}`}
                      />
                      <FormulaBlock
                        formula="Nu = (1−β)Nulam + βNuturb"
                        substitution={`Nu = (1−${formatNumber(result.transitionBlend, 6)}) × ${formatNumber(result.laminarNusselt, 5)} + ${formatNumber(result.transitionBlend, 6)} × ${formatNumber(result.turbulentNusselt, 5)}`}
                        result={`Nu = ${formatNumber(result.nusselt, 5)}`}
                      />
                    </>
                  )}
              </CalculationStep>

              <CalculationStep
                index="06"
                title="求對流係數與冷板平均溫度"
                note="冷板均溫在本模型中代表四周受熱流道的平均壁面溫度。"
              >
                <FormulaBlock
                  formula="h = Nu × k / Dh"
                  substitution={`h = ${formatNumber(result.nusselt, 5)} × ${formatNumber(result.thermalConductivity, 5)} / ${formatNumber(result.hydraulicDiameter, 7)}`}
                  result={`h = ${formatNumber(result.heatTransferCoefficient, 3)} W/(m²·K)`}
                />
                <FormulaBlock
                  formula="ΔTconv = Qloss / (h × Awet)"
                  substitution={`ΔTconv = ${formatNumber(result.heatLoss, 3)} / (${formatNumber(result.heatTransferCoefficient, 3)} × ${formatNumber(result.wettedArea, 7)})`}
                  result={`ΔTconv = ${formatNumber(result.convectionRise, 5)} K`}
                />
                <FormulaBlock
                  formula="Tplate,avg = Tbulk,avg + ΔTconv"
                  substitution={`Tplate,avg = ${formatNumber(result.meanFluidTemp, 4)} + ${formatNumber(result.convectionRise, 5)}`}
                  result={`Tplate,avg = ${formatNumber(result.plateAverage, 4)} °C`}
                />
              </CalculationStep>
            </div>

            <div className="calculation-notes">
              <div>
                <h3>
                  <Info size={17} aria-hidden="true" />
                  模型假設與限制
                </h3>
                <ul>
                  <li>單一、光滑矩形流道，四周壁面均勻受熱，穩態且為單相流。</li>
                  <li>全部效率損耗皆進入冷卻液，未計入向環境散熱及泵浦發熱。</li>
                  <li>層流採全周等熱通量矩形流道關係式，紊流採 Gnielinski 關係式。</li>
                  <li>未包含冷板材質、底板厚度、熱源面積、接觸熱阻與熱擴散；實際上表面均溫可能較高。</li>
                  <li>EG 50% 與 PG 25% 均以體積濃度（vol%）解讀。</li>
                </ul>
              </div>
              <p className="source-note">
                液體物性資料參考：
                <a
                  href="https://webbook.nist.gov/chemistry/fluid/"
                  target="_blank"
                  rel="noreferrer"
                >
                  NIST
                </a>
                、
                <a
                  href="https://www.dow.com/en-us/pdp.dowtherm-sr-1-heat-transfer-fluid-dyed.25630z.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  DOWTHERM SR-1
                </a>
                、
                <a
                  href="https://www.dow.com/en-us/pdp.dowfrost-lc-25-heat-transfer-fluid.497419z.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  DOWFROST LC 25
                </a>
                。
              </p>
            </div>
          </>
        ) : (
          <div className="calculation-empty">
            <Info size={22} aria-hidden="true" />
            <p>輸入值完整且有效後，這裡會即時列出完整公式與代入過程。</p>
          </div>
        )}
      </section>

      <footer className="app-footer">
        <span>
          <Gauge size={16} aria-hidden="true" />
          即時運算 · 可離線使用
        </span>
        <span>iPhone：Safari 分享 → 加入主畫面</span>
      </footer>
    </main>
  );
}
