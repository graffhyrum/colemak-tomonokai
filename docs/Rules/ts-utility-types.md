
## Core Utility Types

### `Awaited<Type>`
Extract the resolved type of Promise types recursively. Use for modeling async operations and Promise unwrapping.

```typescript  
type A = Awaited<Promise<string>>; // string  
type B = Awaited<Promise<Promise<number>>>; // number  
```  

### `Partial<Type>`
Make all properties optional. Use for update operations and partial object construction.

```typescript  
interface Todo {  
  title: string;  description: string;}  
type PartialTodo = Partial<Todo>; // { title?: string; description?: string; }  
```  

### `Required<Type>`
Make all properties required. Opposite of Partial. Use when enforcing complete object structures.

```typescript  
interface Props {  
  a?: number;  b?: string;}  
type RequiredProps = Required<Props>; // { a: number; b: string; }  
```  

### `Readonly<Type>`
Make all properties readonly. Use for immutable data structures and preventing reassignment.

```typescript  
interface Todo {  
  title: string;}  
type ReadonlyTodo = Readonly<Todo>; // { readonly title: string; }  
```  

### `Record<Keys, Type>`
Create object type with specified keys and value types. Use for mapping and dictionary structures.

```typescript  
type CatName = "miffy" | "boris" | "mordred";interface CatInfo {  
  age: number;  
  breed: string;  
}  
type Cats = Record<CatName, CatInfo>;  
```  

### `Pick<Type, Keys>`
Select specific properties from a type. Use for creating focused interfaces.

```typescript  
interface Todo {  
  title: string;  description: string;  completed: boolean;}  
type TodoPreview = Pick<Todo, "title" | "completed">;  
```  

### `Omit<Type, Keys>`
Remove specific properties from a type. Opposite of Pick. Use for excluding unwanted properties.

```typescript  
interface Todo {  
  title: string;  description: string;  completed: boolean;  createdAt: number;}  
type TodoPreview = Omit<Todo, "description">;  
```  

## Union Manipulation Types

### `Exclude<UnionType, ExcludedMembers>`
Remove types from union. Use for filtering union members.

```typescript  
type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"  
type T1 = Exclude<string | number | (() => void), Function>; // string | number  
```  

### `Extract<Type, Union>`
Extract matching types from union. Use for selecting specific union members.

```typescript  
type T0 = Extract<"a" | "b" | "c", "a" | "f">; // "a"  
type T1 = Extract<string | number | (() => void), Function>; // () => void  
```  

### `NonNullable<Type>`
Remove null and undefined from type. Use for ensuring non-null values.

```typescript  
type T0 = NonNullable<string | number | undefined>; // string | number  
type T1 = NonNullable<string[] | null | undefined>; // string[]  
```  

## Function Type Utilities

### `Parameters<Type>`
Extract parameter types as tuple. Use for function parameter analysis.

```typescript  
declare function f1(arg: { a: number; b: string }): void;  
type T0 = Parameters<() => string>; // []  
type T1 = Parameters<(s: string) => void>; // [s: string]  
type T3 = Parameters<typeof f1>; // [arg: { a: number; b: string }]  
```  

### `ConstructorParameters<Type>`
Extract constructor parameter types. Use for class instantiation analysis.

```typescript  
class C {  
  constructor(a: number, b: string) {}}  
type T0 = ConstructorParameters<ErrorConstructor>; // [message?: string]  
type T3 = ConstructorParameters<typeof C>; // [a: number, b: string]  
```  

### `ReturnType<Type>`
Extract function return type. Use for function result analysis.

```typescript  
declare function f1(): { a: number; b: string };  
type T0 = ReturnType<() => string>; // string  
type T1 = ReturnType<(s: string) => void>; // void  
type T4 = ReturnType<typeof f1>; // { a: number; b: string }  
```  

### `InstanceType<Type>`
Extract instance type from constructor. Use for class instance analysis.

```typescript  
class C {  
  x = 0;  y = 0;}  
type T0 = InstanceType<typeof C>; // C  
```  

## Advanced Utilities

### `NoInfer<Type>`
Block type inference. Use to prevent unwanted type inference in generics.

```typescript  
function createStreetLight<C extends string>(  
  colors: C[],  defaultColor?: NoInfer<C>) {  
  // ...}  
```  

### `ThisParameterType<Type>`
Extract 'this' parameter type. Use for analyzing this-bound functions.

```typescript  
function toHex(this: Number) {  
  return this.toString(16);}  
type T = ThisParameterType<typeof toHex>; // Number  
```  

### `OmitThisParameter<Type>`
Remove 'this' parameter from function type. Use for converting methods to functions.

```typescript  
function toHex(this: Number) {  
  return this.toString(16);}  
const fiveToHex: OmitThisParameter<typeof toHex> = toHex.bind(5);  
```  

### `ThisType<Type>`
Mark contextual 'this' type. Use with noImplicitThis flag for typed method contexts.

```typescript  
type ObjectDescriptor<D, M> = {  
  data?: D;  
  methods?: M & ThisType<D & M>;  
};  
```  

## String Manipulation Types

### `Uppercase<StringType>`
Convert string literal to uppercase.

### `Lowercase<StringType>`
Convert string literal to lowercase.

### `Capitalize<StringType>`
Capitalize first character of string literal.

### `Uncapitalize<StringType>`
Uncapitalize first character of string literal.

Use these with template literal types for compile-time string transformations.

## Application Rules

1. **Prefer composition**: Chain utility types for complex transformations
2. **Type safety first**: Use utility types to maintain type correctness during transformations
3. **Readability**: Choose the most expressive utility type for the use case
4. **Performance**: Utility types are compile-time only and have no runtime cost
5. **Constraints**: Respect TypeScript version requirements for each utility type
6. **Error handling**: Use conditional types with utility types for robust type definitions
