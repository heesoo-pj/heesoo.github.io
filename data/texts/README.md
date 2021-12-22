# 콘텐츠 데이터

콘텐츠용 JSON 데이터 파일이 위치한 폴더입니다.

페이지별로 폴더를 구분해서 사용할 수 있으며, UI 요소가 아닌 텍스트 데이터는  
DB를 대신하여 이곳 에서 다룹니다.

각 페이지의 frontmatter의 `data` 항목에 데이터 파일을 지정하면
`data.{filename}.{prop}` 형식으로 사용할 수 있습니다.

예제)

/data/texts/pages/main/profile.json

```json
{
  "name": "json",
  "age": 24
}
```
/src/view/pages/main/main.ejs
```
---
data: 
  - /data/texts/pages/main/profile.json
---

<p>이름: <%= data.profile.name %></p>
<p>나이: <%= data.profile.age %>세</p>

```

```html
<p>이름: json </p>
<p>나이: 24세</p>
```
