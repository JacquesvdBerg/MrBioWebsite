import { grades, otherAudience } from "@/lib/site";

export function GradeOptions({ emptyLabel }: { emptyLabel?: string }) {
  return (
    <>
      {emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}
      {grades.map((grade) => (
        <option key={grade} value={grade}>
          Graad {grade}
        </option>
      ))}
      <option value={otherAudience}>Ander (ouer of onderwyser)</option>
    </>
  );
}
