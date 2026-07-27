import pandas as pd
import numpy as np

SEED = 88



def get_data(data):
    '''
    원본 데이터를 전처리 해주는 함수
    data = read_{file_type}('file_path')
    '''

    df = pd.DataFrame(data)

    del_col = [
        'GUBUN', 'NO', '확인 필요 사항', 'S1', 'S2','선문1_3_TXT', '선문2_1', '선문2_2',
        'H선문2', '선문3', '배문4_9997_TXT', '문1', '문2_01', '문2_01_9997_TXT', 
        '문2_02', '문2_03', '문3_9997', '문3_9997_TXT', '문5_1', '문5_2',
        '문7_9997_TXT', '문8_9997_TXT', '문9', '문10', '문11', '문11_9998', '문12',
        '문12_9998', '문2_03_9997_TXT'
    ]
    # 지울 컬럼 추가 로직
    for i in range(1, 23):
        if i < 11:
            del_col.append(f'문4_{i}_1')
            del_col.append(f'문20_{i}')
        elif i == 11:
            del_col.append(f'문4_{i-1}_TXT')

        if i <= 11:
            del_col.append(f'문4_01_{i}')

        if i <= 12:
            del_col.append(f'문4_02A_{i}')
            del_col.append(f'문4_02B_{i}')
            del_col.append(f'문4_02C_{i}')
            del_col.append(f'문4_02D_{i}')
            del_col.append(f'문4_02E_{i}')
            del_col.append(f'문4_02F_{i}')
            del_col.append(f'문4_02G_{i}')
            del_col.append(f'문4_02H_{i}')
        elif i == 13:
            del_col.append(f'문4_02A_{i-1}_TXT')
            del_col.append(f'문4_02B_{i-1}_TXT')
            del_col.append(f'문4_02C_{i-1}_TXT')
            del_col.append(f'문4_02D_{i-1}_TXT')
            del_col.append(f'문4_02E_{i-1}_TXT')
            del_col.append(f'문4_02F_{i-1}_TXT')
            del_col.append(f'문4_02G_{i-1}_TXT')
            del_col.append(f'문4_02H_{i-1}_TXT')
        if i < 20:
            del_col.append(f'문6_{i}')
            if i == 19:
                del_col.append(f'문6_{i}_TXT')

        if i <= 22:
            del_col.append(f'문13_01_{i}')
            del_col.append(f'문13_02_{i}')

        if i <= 13:
            del_col.append(f'문14_{i}')

        if i <= 8:
            del_col.append(f'문23_{i}')

    df_clean = df.drop(columns=del_col)
    # df_clean = df_clean.loc[:, :'문7']
    df_clean = df_clean[df_clean.loc[:, :'문7'].columns.tolist() + ['문40', '문42']]

    # 멀티 핫 인코딩 로직
    cols = df_clean.loc[:,'문3_1' : '문3_12'].columns
    df_clean[cols] = (df_clean[cols] >= 1).astype(int)

    # 종교없음 숫자 9998 배정된걸 0으로 변경
    df_clean['배문4'] = np.where(df_clean['배문4'] < 5, df_clean['배문4'], 0)

    # 단위 (만원) 에 맞추는 로직
    df_clean['배문6_정리'] = np.where(
        df_clean['배문6'] >= 100_000, 
        df_clean['배문6'] / 10000, df_clean['배문6']
    )

    df_clean['배문6_정리'] = np.log1p(df_clean['배문6_정리'])

    # 기타 항목 기존 비율대로 분배 하는 로직
    mask = df_clean['문7'] == 9997
    valid = df_clean.loc[df_clean['문7'].between(1, 5), '문7']
    probabilities = valid.value_counts(normalize=True).sort_index() # normalize 차지하는 비율로 계산

    rng = np.random.default_rng(SEED)


    df_clean.loc[mask, '문7'] = rng.choice(
        probabilities.index,    # 뽑을 후보 (1 ~ 5)
        size=mask.sum(),        # '9997' 개수 만큼 추출
        p=probabilities.values  # 기존 분포를 추출 확률로 사용
    )

    df_clean = df_clean.fillna(0)
    

    return df_clean.drop(columns='배문6')