## 타입스크립트 파일 적용

### 환경 구성

- npm 초기화 `yarn init -y`

- 타입스크립트 라이브러리 설치 `yarn add --dev typescript`

- `tsconfig.json` 작성

- 타입스크립트 파일을 자바스크립트 파일로 변환 -> `tsc app.js` 명령어 터미널에 작성 또는 `package.json > scripts` 명령어 추가

<br/>
<br/>

### HTMLParagraphElement와 HTMLElement의 차이점

`HTMLParagraphElement`와 `HTMLElement`는 DOM 타입은 동일하지만

`HTMLElement` 모든 HTML 요소에 사용될 수 있지만 `HTMLParagraphElement`는

p태그 요소의 사용을 명확하게 인식합니다.

<br/>

### : 타입 선언과 as 타입 단언의 차이점

```typescript
const deathsTotal: HTMLParagraphElement = $(".deaths");
```

첫번째 코드는 `deathsTotal` 변수를 `HTMLParagraphElement`로 명시적으로

선언합니다. 반드시 반환하는 타입이 `HTMLParagraphElement`에 일치하지 않으면

컴파일 오류가 발생합니다 좀 더 엄격한 타입체크라 할 수 있겠습니다

```typescript
const deathsTotal = $(".deaths") as HTMLParagraphElement;
```

두번째 코드는 `deathsTotal` 변수를 `HTMLParagraphElement`로 명시적으로

단언합니다. 반환하는 타입이 `HTMLParagraphElement`와 일치하지 않아도

컴파일 오류가 발생하지 않습니다, 좀 더 유연한 타입체크라 할 수 있겠습니다
