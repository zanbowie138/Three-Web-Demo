export function qs<T extends HTMLElement>(selectors: string) {
    return document.querySelector<T>(selectors)!
}