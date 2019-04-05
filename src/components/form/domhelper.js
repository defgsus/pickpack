

export function valueFromEvent(event) {

    if (typeof event === "object") {
        try {
            event.preventDefault();
        }
        catch {
            return event;
        }

        let value = undefined;

        if (event.target.type === "checkbox")
            value = event.target.checked;

        else if (event.target.tagName) {
            switch (event.target.tagName) {
                default:
                    value = event.target.value;
            }
        }

        return value;
    }
    else
        return event;
}