"use client";

import { createContext } from "react";

/** Скрытая вкладка не подписана на обновления стора, пока её снова не откроют. */
export const TabLiveContext = createContext(true);
