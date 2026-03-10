const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = new Set([
  "ECONNRESET",
  "EAI_AGAIN",
  "ENOTFOUND",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
]);

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

export async function retryingFetch(input: FetchInput, init?: FetchInit) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(cloneInput(input), cloneInit(init));

      if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === 3) {
        return response;
      }

      await delay(attempt * 250);
    } catch (error) {
      lastError = error;

      if (!shouldRetryError(error) || attempt === 3) {
        throw error;
      }

      await delay(attempt * 250);
    }
  }

  throw lastError;
}

function cloneInput(input: FetchInput): FetchInput {
  if (input instanceof Request) {
    return input.clone() as FetchInput;
  }

  return input;
}

function cloneInit(init?: FetchInit): FetchInit | undefined {
  if (!init) {
    return undefined;
  }

  return {
    ...init,
    headers: init.headers ? new Headers(init.headers) : undefined,
  };
}

function shouldRetryError(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error).toLowerCase();

  return (
    (typeof code === "string" && RETRYABLE_ERROR_CODES.has(code)) ||
    message.includes("fetch failed") ||
    message.includes("connection reset") ||
    message.includes("network")
  );
}

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const maybeError = error as {
    code?: unknown;
    cause?: {
      code?: unknown;
    };
  };

  if (typeof maybeError.cause?.code === "string") {
    return maybeError.cause.code;
  }

  if (typeof maybeError.code === "string") {
    return maybeError.code;
  }

  return null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const causeMessage =
      error.cause instanceof Error ? error.cause.message : String(error.cause ?? "");

    return `${error.message} ${causeMessage}`.trim();
  }

  return String(error ?? "");
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
