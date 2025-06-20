'use strict';

function calculate(){
    core_storage_data.sources = JSON.stringify(globalThis.sources);
    core_storage_update();

    let assets = 0;
    let cash = 0;
    let savings = 0;
    let shares = 0;
    let total = 0;
    let total_gain = 0;
    let total_increase = 0;
    const source_totals = {
      'assets': {},
      'savings': {},
    };

    const sources = globalThis.sources;
    for(const asset in sources.assets){
        const asset_shares = sources.assets[asset].shares;
        const amount = asset_shares * sources.assets[asset].price;
        const interval_gain = asset_shares * sources.assets[asset].gain;

        let gain = 0;
        let gain_increase = 0;
        gain = interval_gain * sources.assets[asset].interval;

        if(document.getElementById('asset_' + asset + '_apply').checked){
            assets += 1;
            shares += asset_shares;
            total += amount;
            total_gain += gain;
            total_increase += gain_increase;
        }

        source_totals['asset_' + asset] = {
          'amount': amount,
          'dividend': interval_gain,
          'gain': gain,
          'gain_increase': gain_increase,
        };
    }

    for(const saving in sources.savings){
        const amount = sources.savings[saving].amount;
        const interval_gain = sources.savings[saving].gain;

        let gain = 0;
        let gain_increase = 0;
        const interest_percent_year = (interval_gain / 100) * sources.savings[saving].interval;
        gain = amount * interest_percent_year;
        gain_increase = (amount + gain) * interest_percent_year - gain;

        if(document.getElementById('savings_' + saving + '_apply').checked){
            cash += amount;
            savings += 1;
            total += amount;
            total_gain += gain;
            total_increase += gain_increase;
        }

        source_totals['savings_' + saving] = {
          'amount': amount,
          'gain': gain,
          'gain_increase': gain_increase,
        };
    }

    for(const saving in sources.savings){
        document.getElementById('savings_' + saving + '_total').innerHTML = format_number(source_totals['savings_' + saving].gain);
        document.getElementById('savings_' + saving + '_total_increase').innerHTML = format_number(source_totals['savings_' + saving].gain_increase);
        document.getElementById('savings_' + saving + '_year_gain_percent').innerHTML = format_number(source_totals['savings_' + saving].gain / total_gain * 100);
    }
    for(const asset in sources.assets){
        document.getElementById('asset_' + asset + '_amount').innerHTML = format_number(
          source_totals['asset_' + asset].amount,
          2
        );
        document.getElementById('asset_' + asset + '_dividend').innerHTML = format_number(source_totals['asset_' + asset].dividend);
        document.getElementById('asset_' + asset + '_total').innerHTML = format_number(source_totals['asset_' + asset].gain);
        document.getElementById('asset_' + asset + '_gain_percent').innerHTML = format_number(source_totals['asset_' + asset].gain / source_totals['asset_' + asset].amount * 100);
        document.getElementById('asset_' + asset + '_year_gain_percent').innerHTML = format_number(source_totals['asset_' + asset].gain / total_gain * 100);
    }

    core_elements.assets.innerHTML = format_number(
      assets,
      0
    );
    core_elements.cash.innerHTML = format_number(
      cash,
      2
    );
    core_elements.cash_percent.innerHTML = format_number((cash / total) * 100);
    core_elements.savings.innerHTML = format_number(
      savings,
      0
    );
    core_elements.shares.innerHTML = format_number(
      shares,
      0
    );
    core_elements.total.innerHTML = format_number(
      total,
      2
    );
    core_elements.value.innerHTML = format_number(
      total - cash,
      2
    );
    core_elements.value_percent.innerHTML = format_number(((total - cash) / total) * 100);

    for(const asset in sources.assets){
        document.getElementById('asset_' + asset + '_percent').innerHTML = format_number(source_totals['asset_' + asset].amount / total * 100);
    }
    for(const saving in sources.savings){
        document.getElementById('savings_' + saving + '_percent').innerHTML = format_number(source_totals['savings_' + saving].amount / total * 100);
    }

    for(const interval in intervals){
        const increase = total_gain / intervals[interval];
        const increase_year = total_increase / intervals[interval];

        core_elements['total_' + interval].innerHTML = format_number(increase);
        core_elements['total_' + interval + '_percent'].innerHTML = total === 0
          ? ''
          : format_number((increase / total) * 100);
        core_elements['total_' + interval + '_increase_' + interval].innerHTML = format_number(increase_year / intervals[interval]);
        core_elements['total_' + interval + '_increase_yearly'].innerHTML = format_number(increase_year);
    }

    calculate_info();
}

function calculate_info(){
    core_storage_save([
      'goal_time',
      'tax',
    ]);

    const gain_per_second = Number(core_replace({
      'patterns': {
        ',': '',
      },
      'string': core_elements.total_hour.textContent,
    })) / 3600;
    core_elements.goal_time_gain.innerHTML = gain_per_second <= 0
      ? ''
      : time_format({
          'date': timestamp_to_date(core_storage_data.goal_time / gain_per_second * 1000),
          'diff': true,
          'milliseconds': true,
        });

    const gain_per_year = Number(core_replace({
      'patterns': {
        ',': '',
      },
      'string': core_elements.total_year.textContent,
    }));
    core_elements.tax_result.innerHTML = format_number(gain_per_year * (core_elements.tax.value / 100));
}

function format_number(number, pad){
    if(!Number.isFinite(number)){
        return '';
    }

    pad = pad === void 0
      ? 7
      : pad;
    let result = core_number_format({
      'decimals_max': pad,
      'decimals_min': 0,
      'number': number,
    });
    if(pad === 0){
        return result;
    }

    const decimal = result.indexOf('.');
    let decimal_length = decimal === -1
      ? -1
      : result.length - decimal - 1;
    if(decimal_length === 1){
        result += '0';
        decimal_length++;
    }

    while(decimal_length < pad){
        result += '&nbsp;';
        decimal_length++;
    }

    return result;
}

function new_asset(id, shares, price, gain, interval){
    sources.assets[id] = {
      'shares': shares,
      'price': price,
      'gain': gain,
      'interval': interval,
    };

    return '<tr>'
      + '<td><input id="asset_' + id + '_apply" onclick="calculate()" type=checkbox checked>'
      + '<td>' + id
      + '<td>' + format_number(shares, 0)
      + '<td>' + format_number(price, 2)
      + '<td id="asset_' + id + '_amount">'
      + '<td id="asset_' + id + '_percent">'
      + '<td>' + format_number(gain)
      + '<td class=center>' + interval
      + '<td id="asset_' + id + '_dividend">'
      + '<td id="asset_' + id + '_total">'
      + '<td id="asset_' + id + '_gain_percent">'
      + '<td id="asset_' + id + '_year_gain_percent">';
}

function new_savings(id, amount, gain, interval){
    sources.savings[id] = {
      'amount': amount,
      'gain': gain,
      'interval': interval,
    };

    return '<tr>'
      + '<td><input id="savings_' + id + '_apply" onclick="calculate()" type=checkbox checked>'
      + '<td>' + id
      + '<td>' + format_number(amount, 2)
      + '<td id="savings_' + id + '_percent">'
      + '<td>' + gain
      + '<td id="savings_' + id + '_total">'
      + '<td id="savings_' + id + '_total_increase">'
      + '<td id="savings_' + id + '_year_gain_percent">';
}

function repo_init(){
    core_repo_init({
      'events': {
        'assets_all': {
          'onchange': function(){
              const assets = globalThis.sources.assets;
              for(const asset in assets){
                  document.getElementById('asset_' + asset + '_apply').checked = this.checked;
              }

              calculate();
          },
        },
        'savings_all': {
          'onchange': function(){
              const savings = globalThis.sources.savings;
              for(const saving in savings){
                  document.getElementById('savings_' + saving + '_apply').checked = this.checked;
              }

              calculate();
          },
        },
        'goal_time': {
          'oninput': calculate_info,
        },
        'tax': {
          'oninput': calculate_info,
        },
      },
      'globals': {
        'intervals': {
          'hour': 8760,
          'work': 2080,
          'day': 365,
          'week': 52,
          'month': 12,
          'quarter': 4,
          'half': 2,
          'year': 1,
          'custom': .5,
        },
        'sources': {
          'assets': {},
          'savings': {},
        },
      },
      'storage': {
        'goal_time': 1,
        'sources': '{"assets":{"example asset":{"shares":100,"price":25,"gain":1,"interval":12}},"savings":{"example savings":{"amount":5000,"gain":0.23,"interval":12}}}',
        'tax': 15,
      },
      'storage-menu': '<textarea id=sources></textarea><br>',
      'title': 'Finances.htm',
      'ui_elements': [
        'assets',
        'cash',
        'cash_percent',
        'goal_time_gain',
        'savings',
        'shares',
        'tax',
        'tax_result',
        'total',
        'value',
        'value_percent',
      ],
    });

    let intervalsbody = '';
    for(const interval in intervals){
        intervalsbody += '<tr>'
          + '<td>' + interval
          + '<td>' + (interval === 'custom'
            ? '<input class=mini id=total_custom_intervals step=any type=number value=.5>'
            : intervals[interval])
          + '<td id=total_' + interval + '>'
          + '<td id=total_' + interval + '_percent>'
          + '<td id=total_' + interval + '_increase_' + interval + '>'
          + '<td id=total_' + interval + '_increase_yearly>';
    }
    document.getElementById('intervals_body').innerHTML = intervalsbody;
    document.getElementById('total_custom_intervals').oninput = function(){
        let customintervals = this.value;
        if(globalThis.isNaN(customintervals)
          || customintervals < 0){
            customintervals = 0;
        }
        intervals.custom = customintervals;
        calculate();
    };
    for(const interval in intervals){
        core_elements['total_' + interval] = document.getElementById('total_' + interval);
        core_elements['total_' + interval + '_percent'] = document.getElementById('total_' + interval + '_percent');
        core_elements['total_' + interval + '_increase_' + interval] = document.getElementById('total_' + interval + '_increase_' + interval);
        core_elements['total_' + interval + '_increase_yearly'] = document.getElementById('total_' + interval + '_increase_yearly');
    }

    const json = JSON.parse(core_storage_data.sources);

    let rows = '';
    const assets = json.assets;
    for(const asset in assets){
        rows += new_asset(
          asset,
          assets[asset].shares,
          assets[asset].price,
          assets[asset].gain,
          assets[asset].interval
        );
    }
    document.getElementById('assets_body').innerHTML = rows;

    rows = '';
    const savings = json.savings;
    for(const saving in savings){
        rows += new_savings(
          saving,
          savings[saving].amount,
          savings[saving].gain,
          savings[saving].interval
        );
    }
    document.getElementById('savings_body').innerHTML = rows;

    calculate();
}
