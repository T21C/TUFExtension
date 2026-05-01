export function createTufButtonIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("aria-hidden", "true");

  const shield = document.createElementNS("http://www.w3.org/2000/svg", "path");
  shield.setAttribute(
    "d",
    "M4.5 3.5h15v6.1c-3.45.25-6.56 2.15-8.62 5.03-1.39 1.94-2.67 4-4.16 5.7C5.27 18.6 4.5 16.18 4.5 13.32V3.5Z"
  );
  shield.setAttribute("fill", "#2A1643");
  shield.setAttribute("stroke", "#B7A7E7");
  shield.setAttribute("stroke-width", "1.25");
  shield.setAttribute("stroke-linejoin", "round");

  const planet = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  planet.setAttribute("cx", "12.4");
  planet.setAttribute("cy", "13.35");
  planet.setAttribute("rx", "4.45");
  planet.setAttribute("ry", "4.2");
  planet.setAttribute("fill", "#101014");
  planet.setAttribute("stroke", "#8A8299");
  planet.setAttribute("stroke-width", "0.85");

  const orbitShadow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  orbitShadow.setAttribute(
    "d",
    "M6.1 20.05C9.1 15.2 14.1 9.25 19.7 6.55"
  );
  orbitShadow.setAttribute("stroke", "#0B0B0D");
  orbitShadow.setAttribute("stroke-width", "4.45");
  orbitShadow.setAttribute("stroke-linecap", "round");

  const orbit = document.createElementNS("http://www.w3.org/2000/svg", "path");
  orbit.setAttribute("d", "M6.1 20.05C9.1 15.2 14.1 9.25 19.7 6.55");
  orbit.setAttribute("stroke", "#D63343");
  orbit.setAttribute("stroke-width", "3.25");
  orbit.setAttribute("stroke-linecap", "round");

  const orbitHighlight = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  orbitHighlight.setAttribute("d", "M7.45 18.2C10.5 14.05 14.5 9.8 18.75 7.55");
  orbitHighlight.setAttribute("stroke", "#FF6D7D");
  orbitHighlight.setAttribute("stroke-width", "0.8");
  orbitHighlight.setAttribute("stroke-linecap", "round");
  orbitHighlight.setAttribute("opacity", "0.85");

  svg.append(shield, planet, orbitShadow, orbit, orbitHighlight);
  return svg;
}
