# Ridge AI Push - 색상 가이드라인

## 📋 텍스트 색상 표준

### 🎯 **기본 텍스트 색상**

```typescript
// ✅ 권장 사용 색상
text-gray-800    // 주요 텍스트 (제목, 레이블, 중요한 내용)
text-gray-700    // 보조 텍스트 (설명, 부제목)
text-gray-900    // 강조 텍스트 (헤더, 중요한 수치)

// ❌ 사용 금지 색상 (가독성 문제)
text-gray-500    // 너무 연함 - 사용하지 말 것
text-gray-600    // 대비 부족 - 사용하지 말 것
text-gray-400    // 매우 연함 - 사용하지 말 것
```

### 🎨 **색상 사용 규칙**

#### 1. **주요 텍스트** - `text-gray-800`
```tsx
// 사용 예시
<h2 className="text-lg font-semibold text-gray-800">캠페인 제목</h2>
<label className="block text-sm font-medium text-gray-800 mb-2">API 키</label>
<div className="text-sm text-gray-800">총 구독자</div>
```

#### 2. **보조 텍스트** - `text-gray-700`
```tsx
// 사용 예시
<p className="text-sm text-gray-700">설명 텍스트나 안내 문구</p>
<span className="text-xs text-gray-700">날짜 정보</span>
```

#### 3. **강조 텍스트** - `text-gray-900`
```tsx
// 사용 예시
<h1 className="text-2xl font-bold text-gray-900">메인 제목</h1>
<div className="text-2xl font-bold text-gray-900">0</div> // 통계 수치
```

### 🎯 **네비게이션 및 버튼**

```tsx
// 네비게이션 탭 (비활성)
className="text-gray-800 hover:text-gray-900"

// 네비게이션 탭 (활성)
className="text-indigo-600 border-b-2 border-indigo-600"

// 버튼 텍스트
className="text-white" // 컬러 배경 버튼
className="text-gray-800" // 기본 버튼
```

### 🎨 **컴포넌트별 색상 패턴**

#### **Card 컴포넌트**
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-lg font-semibold text-gray-800">제목</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-gray-900">통계값</div>
    <div className="text-sm text-gray-800">레이블</div>
    <p className="text-sm text-gray-700 mt-1">설명 텍스트</p>
  </CardContent>
</Card>
```

#### **폼 요소**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-800 mb-2">
    입력 항목명
  </label>
  <input className="..." />
  <p className="text-sm text-gray-700 mt-1">도움말 텍스트</p>
</div>
```

#### **통계 표시**
```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <div className="text-2xl font-bold text-gray-900">1,234</div>
  <div className="text-sm text-gray-800">총 사용자</div>
  <div className="text-sm text-gray-700 mt-1">지난 달 대비 +12%</div>
</div>
```

### 🚨 **주의사항**

1. **절대 사용 금지**: `text-gray-500`, `text-gray-600`, `text-gray-400`
2. **다크모드 고려**: 필요시 `dark:text-gray-200` 등 다크모드 변형 추가
3. **접근성**: 배경색과 충분한 명도 대비 확보
4. **일관성**: 같은 역할의 텍스트는 같은 색상 사용

### 🎯 **새 기능 개발 시 체크리스트**

- [ ] 주요 텍스트에 `text-gray-800` 사용
- [ ] 보조 텍스트에 `text-gray-700` 사용  
- [ ] 강조 텍스트에 `text-gray-900` 사용
- [ ] `text-gray-500/600` 사용하지 않았는지 확인
- [ ] 전체적인 색상 일관성 확인

### 📝 **참고사항**

이 가이드라인은 2024년 12월 텍스트 가독성 개선 작업 후 확립되었습니다.
모든 새로운 컴포넌트와 기능 개발 시 이 표준을 따라주세요.