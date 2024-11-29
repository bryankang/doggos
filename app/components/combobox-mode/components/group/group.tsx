import { Command } from "cmdk";
import { FC, ReactNode } from "react";
import styles from "./group.module.css";

export type GroupProps = {
  children?: ReactNode;
};

export const Group: FC<GroupProps> = ({ children }) => {
  return <Command.Group className={styles.root}>{children}</Command.Group>;
};
